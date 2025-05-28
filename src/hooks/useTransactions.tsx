import { useState } from "react"
import { Transaction } from "../types/Transaction"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (transaction: Transaction) => {
    console.log("Nova transação:", transaction) // ✅ debug
    setTransactions(prev => [...prev, transaction])
  }

  return { transactions, addTransaction }
}
