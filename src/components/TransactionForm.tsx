 import { useEffect, useState } from "react";
import { Transaction } from "../types/Transaction";

type Props = {
  onAdd: (transaction: Transaction) => void;
  editing: Transaction | null;
  onCancelEdit?: () => void; // Nova prop para lidar com cancelamento
};

export function TransactionForm({ onAdd, editing, onCancelEdit }: Props) {
  const [transaction, setTransaction] = useState<Transaction>({
    id: crypto.randomUUID(),
    description: "",
    amount: 0,
    date: "",
    category: "",
    type: "saida",
    paymentMethod: "em aberto",
    pago: false,
    dataPagamento: ""
  });

  // Atualiza o formulário quando a transação em edição muda
  useEffect(() => {
    if (editing) {
      setTransaction(editing);
    } else {
      resetForm();
    }
  }, [editing]);

  const resetForm = () => {
    setTransaction({
      id: crypto.randomUUID(),
      description: "",
      amount: 0,
      date: "",
      category: "",
      type: "saida",
      paymentMethod: "em aberto",
      pago: false,
      dataPagamento: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transactionToSave = editing
      ? transaction
      : { ...transaction, id: crypto.randomUUID() };

    onAdd(transactionToSave);

    if (!editing) resetForm();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`transaction-form ${editing ? "editing-mode" : ""}`}
    >
      <label>
        Descrição:
        <input
          type="text"
          value={transaction.description}
          onChange={(e) =>
            setTransaction({ ...transaction, description: e.target.value })
          }
          required
        />
      </label>

      <label>
        Valor:
        <input
          type="number"
          step="0.01"
          value={transaction.amount || ""}
          onChange={(e) =>
            setTransaction({
              ...transaction,
              amount: parseFloat(e.target.value) || 0
            })
          }
          required
        />
      </label>

      <label>
        Data:
        <input
          type="date"
          value={transaction.date}
          onChange={(e) =>
            setTransaction({ ...transaction, date: e.target.value })
          }
          required
        />
      </label>

      <label>
        Categoria:
        <input
          type="text"
          value={transaction.category}
          onChange={(e) =>
            setTransaction({ ...transaction, category: e.target.value })
          }
          required
        />
      </label>

      <label>
        Tipo:
        <select
          value={transaction.type}
          onChange={(e) =>
            setTransaction({
              ...transaction,
              type: e.target.value as "entrada" | "saida"
            })
          }
          required
        >
          <option value="entrada">Receita</option>
          <option value="saida">Despesa</option>
        </select>
      </label>

      <label>
        Forma de Pagamento:
        <select
          value={transaction.paymentMethod}
          onChange={(e) =>
            setTransaction({
              ...transaction,
              paymentMethod: e.target.value as Transaction["paymentMethod"]
            })
          }
          required
        >
          <option value="crédito">💳 Crédito</option>
          <option value="débito">💳 Débito</option>
          <option value="dinheiro">💸 Dinheiro</option>
          <option value="pix">❖ Pix</option>
          <option value="em aberto">⏳ Em aberto</option>
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {editing ? "Salvar Alterações" : "Adicionar Transação"}
        </button>

        {editing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="cancel-btn"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
