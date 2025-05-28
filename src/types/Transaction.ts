export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "entrada" | "saida";
  paymentMethod: "crédito" | "débito" | "dinheiro" | "pix" | "em aberto";
  pago?: boolean;
  dataPagamento?: string;
};
