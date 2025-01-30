import { ITransactionRepository } from '../interfaces/transactions/ITransactionRepository';
import { PrismaClient } from '@prisma/client';
import { Transaction } from '@prisma/client';



export class TransactionRepository implements ITransactionRepository {

    private prisma: PrismaClient;
    
      constructor(prisma: PrismaClient) {
        this.prisma = prisma;
      }

  async create(transaction: {
    userId: string;
    amount: number;
    transactionId: string;
    paymentMethod: string;
    status: string;
    subscriptionId?: string | null; // Optional field
  }): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data: {
        userId: transaction.userId,
        amount: transaction.amount,
        transactionId: transaction.transactionId,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        subscriptionId : transaction.subscriptionId
      },
    });
  }

  async findById(transactionId: string): Promise<Transaction | null> {
    return await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany({
      where: { userId },
    });
  }

  async updateStatus(transactionId: string, status: string): Promise<void> {
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }
}
