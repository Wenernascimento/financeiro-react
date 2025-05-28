import { Transaction } from "../types/Transaction";
import { Pencil, Trash } from "lucide-react";
import "./TransactionList.css";

type Props = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAnteciparPagamento: (id: string, dataPagamento: string) => void;
  onDesfazerPagamento: (id: string) => void;
};

// Função para obter a data atual no fuso horário de Brasília
const getBrazilianDate = (): Date => {
  const now = new Date();
  // Ajuste para o fuso horário brasileiro (UTC-3)
  const timezoneOffset = now.getTimezoneOffset() * 60000; // Offset em milissegundos
  const brasilOffset = -3 * 60 * 60 * 1000; // UTC-3 em milissegundos
  const brasilTime = new Date(now.getTime() + timezoneOffset + brasilOffset);
  
  // Zerar horas, minutos, segundos e milissegundos
  brasilTime.setHours(0, 0, 0, 0);
  return brasilTime;
};

// Função para formatar a data como YYYY-MM-DD
const formatDateToISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPaymentStatus = (transaction: Transaction): string => {
  if (transaction.type !== "saida") return "";

  if (transaction.pago) {
    if (transaction.dataPagamento) {
      try {
        // Parse da data no formato YYYY-MM-DD
        const [year, month, day] = transaction.dataPagamento.split('-').map(Number);
        const paymentDate = new Date(year, month - 1, day);
        
        const today = getBrazilianDate();
        
        if (paymentDate.toDateString() === today.toDateString()) {
          return `💸 Pago hoje (${paymentDate.toLocaleDateString("pt-BR")})`;
        }
        return `💸 Pago em ${paymentDate.toLocaleDateString("pt-BR")}`;
      } catch {
        return "💸 Pago (erro na data)";
      }
    }
    return "💸 Pago";
  }

  if (!transaction.date) return "⚠️ Sem data";

  try {
    const today = getBrazilianDate();
    const dueDate = new Date(transaction.date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "❌ Vencida";
    if (diffDays === 0) return "🔴 Vence hoje";
    if (diffDays <= 5) return `🟠 Vence em ${diffDays} dias`;
    return `✅ Vence em ${diffDays} dias`;
  } catch (error) {
    console.error("Erro ao calcular status:", error);
    return "⚠️ Erro no status";
  }
};

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAnteciparPagamento,
  onDesfazerPagamento,
}: Props) {
  const handleAnteciparPagamento = (id: string) => {
    const brazilDate = getBrazilianDate();
    const dateString = formatDateToISOString(brazilDate);
    
    console.log("Data sendo enviada:", dateString, 
                "Data objeto:", brazilDate.toString(),
                "Data UTC:", brazilDate.toISOString());
    
    onAnteciparPagamento(id, dateString);
  };

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className={transaction.pago ? "pago" : ""}
              data-testid={`transaction-${transaction.id}`}
            >
              <td>{transaction.description}</td>
              <td className={transaction.type === "entrada" ? "entrada" : "saida"}>
                R$ {transaction.amount.toFixed(2)}
                <span className="payment-method">
                  ({transaction.paymentMethod})
                </span>
              </td>
              <td>
                {transaction.date
                  ? new Date(transaction.date).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td>{transaction.category}</td>
              <td>{transaction.type === "entrada" ? "Receita" : "Despesa"}</td>
              <td className="status-cell">
                {formatPaymentStatus(transaction) || "-"}
              </td>
              <td className="actions">
                <button
                  onClick={() => onEdit(transaction)}
                  className="edit-btn"
                  title="Editar"
                  aria-label={`Editar ${transaction.description}`}
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => onDelete(transaction.id)}
                  className="delete-btn"
                  title="Excluir"
                  aria-label={`Excluir ${transaction.description}`}
                >
                  <Trash size={18} />
                </button>

                {transaction.type === "saida" && !transaction.pago && (
                  <button
                    onClick={() => handleAnteciparPagamento(transaction.id)}
                    className="antecipar-btn"
                    title="Marcar como Pago"
                    aria-label={`Marcar como pago: ${transaction.description}`}
                  >
                    💰
                  </button>
                )}

                {transaction.type === "saida" && transaction.pago && (
                  <button
                    onClick={() => onDesfazerPagamento(transaction.id)}
                    className="desfazer-btn"
                    title="Desfazer Pagamento"
                    aria-label={`Desfazer pagamento: ${transaction.description}`}
                  >
                    ↩️
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}