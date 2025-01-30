import { Transaction } from '@prisma/client';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(transactionId: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  updateStatus(transactionId: string, status: string): Promise<void>;
}