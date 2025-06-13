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

const getBrazilianDate = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Função para criar Date no horário local, evitando erro de timezone
function parseDateToLocal(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const formatDateToISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number) =>
  amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatPaymentStatus = (transaction: Transaction): string => {
  if (transaction.type !== "saida") return "";

  if (transaction.pago) {
    if (transaction.dataPagamento) {
      try {
        const paymentDate = parseDateToLocal(transaction.dataPagamento);
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
    console.log("transaction.date raw:", transaction.date);
    const today = getBrazilianDate();
    const dueDate = parseDateToLocal(transaction.date);

    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "❌ Vencida";
    if (diffDays === 0) return "🔴 Vence hoje";
    if (diffDays <= 5) return `🟠 Vence em ${diffDays} dias`;
    return `✅ Vence em ${diffDays} dias`;
  } catch {
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
    const dateString = formatDateToISOString(getBrazilianDate());
    onAnteciparPagamento(id, dateString);
  };

  console.log("Renderizando TransactionList", transactions);

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
                {formatCurrency(transaction.amount)}
                <span className="payment-method"> ({transaction.paymentMethod})</span>
              </td>
              <td>
                {transaction.date
                  ? parseDateToLocal(transaction.date).toLocaleDateString("pt-BR")
                  : "-"}
              </td>
              <td>{transaction.category}</td>
              <td>{transaction.type === "entrada" ? "Receita" : "Despesa"}</td>
              <td className="status-cell">{formatPaymentStatus(transaction)}</td>
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
