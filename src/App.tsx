import { useEffect, useState } from "react";
import { Transaction } from "./types/Transaction";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import Summary from "./components/Summary";
import { MonthFilter } from "./components/MonthFilter";
import { Header } from "./components/Header";
import { MonthlyComparisonTable } from "./components/MonthlyComparisonTable";
import "./App.css";


const STORAGE_VERSION = "finance_app_v3";

// Função auxiliar para verificar o armazenamento
function storageAvailable(type: 'localStorage' | 'sessionStorage') {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

// Hook personalizado com persistência melhorada
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const fullKey = `${STORAGE_VERSION}_${key}`;
  const [state, setState] = useState<T>(() => {
    try {
      if (!storageAvailable('localStorage')) {
        console.warn('localStorage não está disponível');
        return defaultValue;
      }

      const storedValue = localStorage.getItem(fullKey);
      if (storedValue === null) return defaultValue;
      
      return JSON.parse(storedValue);
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      localStorage.removeItem(fullKey); // Limpa dados possivelmente corrompidos
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (!storageAvailable('localStorage')) {
        console.warn('localStorage não está disponível para salvar');
        return;
      }

      localStorage.setItem(fullKey, JSON.stringify(state));
      
      // Backup adicional no sessionStorage
      sessionStorage.setItem(fullKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Tenta limpar espaço se estiver cheio
        localStorage.removeItem(`${STORAGE_VERSION}_temp`);
        try {
         localStorage.setItem(`${STORAGE_VERSION}_transactions`, 'INVALID_JSON');
        } catch (e) {
          console.error('Ainda sem espaço após limpeza:', e);
        }
      }
    }
  }, [state, fullKey]);

  return [state, setState];
}

function App() {
  const [transactions, setTransactions] = usePersistentState<Transaction[]>("transactions", []);
  const [selectedMonth, setSelectedMonth] = usePersistentState<string>("selectedMonth", "");
  const [selectedYear, setSelectedYear] = usePersistentState<string>(
    "selectedYear",
    new Date().getFullYear().toString()
  );
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [theme, setTheme] = usePersistentState<"light" | "dark">("theme", "light");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Verifica o status de armazenamento no carregamento
  useEffect(() => {
    if (!storageAvailable('localStorage')) {
      setStorageError('Seu navegador não suporta armazenamento local ou está bloqueado. Os dados podem não persistir.');
    }
  }, []);

  // Status online/offline
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  // Tema claro/escuro
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Força salvamento antes de sair
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(`${STORAGE_VERSION}_transactions`, JSON.stringify(transactions));
      } catch (error) {
        console.error('Erro ao salvar antes de sair:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [transactions]);

  // Antecipar pagamento
  const handleAnteciparPagamento = (id: string) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, pago: true, dataPagamento: new Date().toISOString().slice(0, 10) }
          : transaction
      )
    );
  };

  // Desfazer pagamento
  const desfazPagamento = (id: string) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? { ...transaction, pago: false, dataPagamento: undefined }
          : transaction
      )
    );
  };

  // Adicionar ou editar transação
  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions((prev) =>
      editingTransaction
        ? prev.map((t) => (t.id === editingTransaction.id ? transaction : t))
        : [...prev, { ...transaction, id: Date.now().toString() }]
    );
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta transação?");
    if (confirmDelete) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Filtro por mês e ano
  const filteredTransactions = transactions.filter((t) => {
    const [year, month] = t.date.split("-");
    return (
      (!selectedMonth || month === selectedMonth) &&
      (!selectedYear || year === selectedYear)
    );
  });

  // Exportar backup
  const exportBackup = () => {
    const dataStr = JSON.stringify({
      transactions,
      selectedMonth,
      selectedYear,
      theme,
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportName = `backup_financeiro_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  };

  // Importar backup
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.transactions || !Array.isArray(data.transactions)) {
          throw new Error("Formato de backup inválido");
        }

        const confirmRestore = window.confirm(
          `Deseja restaurar ${data.transactions.length} transações? Isso substituirá seus dados atuais.`
        );
        
        if (confirmRestore) {
          setTransactions(data.transactions);
          if (data.selectedMonth) setSelectedMonth(data.selectedMonth);
          if (data.selectedYear) setSelectedYear(data.selectedYear);
          if (data.theme) setTheme(data.theme);
          alert("Backup restaurado com sucesso!");
        }
      } catch (error) {
        alert("Erro ao processar o arquivo de backup. Verifique se o arquivo está correto.");
        console.error("Erro na importação:", error);
      }
    };
    
    reader.onerror = () => {
      alert("Erro ao ler o arquivo. Tente novamente.");
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Permite reimportar o mesmo arquivo
  };

  return (
    <div className="App">
      <Header />
      {!isOnline && (
        <div className="offline-warning">
          ⚠️ Você está offline - As alterações serão salvas localmente
        </div>
      )}
      {storageError && (
        <div className="storage-error">
          ⚠️ {storageError} Exporte regularmente seus dados para evitar perdas.
        </div>
      )}
      <div className="main-layout">
        <div className="left-panel">
          <div className="control-buttons">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="theme-toggle-btn"
            >
              Alternar Tema ({theme})
            </button>
            <button onClick={exportBackup} className="backup-btn">
              Exportar Backup
            </button>
            <label htmlFor="file-upload" className="import-btn">
              Importar Backup
              <input 
                id="file-upload" 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <MonthFilter
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />

          <Summary transactions={filteredTransactions} />
          <TransactionForm onAdd={handleAddTransaction} editing={editingTransaction} />
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAnteciparPagamento={handleAnteciparPagamento}
            onDesfazerPagamento={desfazPagamento}
          />
        </div>
        <div className="right-panel">
          <MonthlyComparisonTable transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

export default App;