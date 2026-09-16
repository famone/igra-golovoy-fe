export type TransactionKind = 'topup' | 'withdraw' | 'reward' | 'purchase';

export interface WalletBalance {
  /** Внутренняя валюта — «мячи». */
  coins: number;
  /** Заморожено в активных партиях. */
  locked: number;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amount: number;
  title: string;
  createdAt: string;
}
