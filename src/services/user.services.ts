import { IUserService } from '../interfaces/users/IUserService';
import { IUserRepository } from '../interfaces/users/IUserRepository';
import userRepository from '../repositories/user.repositories';
import { User } from '@prisma/client';
import { ApiError } from '../utils/apierror';

class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await this.userRepository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteUser(id);
  }
}

// Singleton Pattern
const userServiceInstance = new UserService(userRepository);
export default userServiceInstance;
