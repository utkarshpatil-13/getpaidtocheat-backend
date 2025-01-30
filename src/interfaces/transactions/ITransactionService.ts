import { Transaction } from "@prisma/client";

export interface ITransactionService {
  createTransaction(transaction: Transaction): Promise<Transaction>;
  getTransactionById(transactionId: string): Promise<Transaction | null>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: string, status: string): Promise<void>;
}