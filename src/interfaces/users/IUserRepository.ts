import { User } from '@prisma/client';

export interface IUserRepository {
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
