import { PrismaClient, User } from "@prisma/client";
import { UserCreateInput } from '../interfaces/user.interfaces'

const prisma = new PrismaClient();

class UserRepository {

    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    
      // Get User by ID
      async getUserById(userId: string) {
        return await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            subscription: true,
            socialAccounts: true,
            videos: true,
            payouts: true,
            rewards: true,
          },
        });
      }

      // Get all users
      async getAllUsers(): Promise<User[]> {
        return await this.prisma.user.findMany();
      }
    
      // Update User
      async updateUser(userId: string, updateData: Partial<UserCreateInput>) {
        return await this.prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }
    
      // Delete User
      async deleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } });
      }

    // discord methods
    async getUserByDiscordId(discordId: string) {
        return await prisma.user.findUnique({
          where: { discordId },
        });
      }
    
      async createOrUpdateUser(userData: any) {
        return await prisma.user.upsert({
          where: { discordId: userData.discordId },
          update: userData,
          create: userData,
        });
      }
    
}

// Singleton Pattern
const userRepositoryInstance = new UserRepository(new PrismaClient());
export default userRepositoryInstance;
