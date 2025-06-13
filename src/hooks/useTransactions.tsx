 import { Transaction } from "../types/Transaction";
import { usePersistentState } from "./usePersistentState";

export function useTransactions() {
  const [transactions, setTransactions] = usePersistentState<Transaction[]>("transactions", []);

  const addTransaction = (transaction: Transaction) => {
    const nova = { ...transaction, id: Date.now().toString() };
    setTransactions((prev: Transaction[]) => [...prev, nova]);
  };

  const editTransaction = (updated: Transaction) => {
    setTransactions((prev: Transaction[]) =>
      prev.map(tx => tx.id === updated.id ? updated : tx)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev: Transaction[]) => prev.filter(tx => tx.id !== id));
  };

  const markAsPaid = (id: string) => {
    setTransactions((prev: Transaction[]) =>
      prev.map(tx =>
        tx.id === id ? { ...tx, pago: true, dataPagamento: new Date().toISOString().slice(0, 10) } : tx
      )
    );
  };

  const undoPayment = (id: string) => {
    setTransactions((prev: Transaction[]) =>
      prev.map(tx =>
        tx.id === id ? { ...tx, pago: false, dataPagamento: undefined } : tx
      )
    );
  };

  return {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    markAsPaid,
    undoPayment,
  };
}
