import { Transaction } from "../types/Transaction";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  transactions: Transaction[];
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MonthlyComparisonTable({ transactions }: Props) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");

    // Filtrando as transações do mês
    const monthTransactions = transactions.filter(t => t.date.slice(5, 7) === month);

    // Calculando as receitas (income)
    const receita = monthTransactions
      .filter(t => t.type === "entrada")  // Corrigido para o valor do tipo correto
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculando as despesas (expense)
    const despesa = monthTransactions
      .filter(t => t.type === "saida")  // Corrigido para o valor do tipo correto
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculando o saldo
    const saldo = receita - despesa;

    return {
      month: monthNames[i],  // Nome do mês
      receita,
      despesa,
      saldo
    };
  });

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>📊 Comparativo Mensal</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: "1rem"
        }}
      >
        {data.map(({ month, receita, despesa, saldo }) => (
          <div
            key={month}
            style={{
              background: "var(--card-bg)",
              padding: "1rem",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderLeft: `6px solid ${saldo >= 0 ? "#4caf50" : "#f44336"}`,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              height: "260px"
            }}
          >
            <div style={{ flex: 1, marginRight: "1rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>{month}</h3>
              <p style={{ color: "#4caf50", margin: "4px 0" }}>Receitas: R$ {receita.toFixed(2)}</p>
              <p style={{ color: "#f44336", margin: "4px 0" }}>Despesas: R$ {despesa.toFixed(2)}</p>
              <p
                style={{
                  fontWeight: "bold",
                  marginTop: "0.5rem",
                  color: saldo >= 0 ? "#4caf50" : "#f44336"
                }}
              >
                Saldo: R$ {saldo.toFixed(2)}
              </p>
            </div>

            <div style={{ width: "200px", height: "150px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: month, receita, despesa }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receita" fill="#4caf50" barSize={20} />
                  <Bar dataKey="despesa" fill="#f44336" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
