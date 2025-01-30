export interface IPayoutService {
  calculateTotalEarned(userId: string): Promise<number>;
  disburseTotalAmount(userId: string, totalEarned: number, disburseAmount: number): Promise<void>;
}
