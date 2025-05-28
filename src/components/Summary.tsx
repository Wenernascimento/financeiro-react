import React from 'react';
import { Transaction } from "../types/Transaction";

type Props = {
  transactions: Transaction[];
};

const Summary: React.FC<Props> = ({ transactions }) => {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "entrada")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "saida")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="summary">
      <h2>Resumo Financeiro</h2>
      <div className="summary-item">
        <h3>Total de Receitas</h3>
        <p>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalIncome)}
        </p>
      </div>
      <div className="summary-item">
        <h3>Total de Despesas</h3>
        <p>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalExpense)}
        </p>
      </div>
      <div className="summary-item">
        <h3>Saldo</h3>
        <p
          style={{
            color: balance >= 0 ? "green" : "red",
          }}
        >
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(balance)}
        </p>
      </div>
    </div>
  );
};

export default Summary;
