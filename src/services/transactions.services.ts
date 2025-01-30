import { ITransactionService } from '../interfaces/transactions/ITransactionService';
import { Transaction } from '@prisma/client';
import { TransactionRepository } from '../repositories/transactions.repositories';

export class TransactionService implements ITransactionService {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return await this.transactionRepository.create(transaction as Transaction);
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return await this.transactionRepository.findById(transactionId);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionRepository.findByUserId(userId);
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    await this.transactionRepository.updateStatus(transactionId, status);
  }
}
