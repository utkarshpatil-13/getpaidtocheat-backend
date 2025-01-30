import { PrismaClient, User } from '@prisma/client';

export class AdminRepository {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient){
        this.prisma = prisma;
    }

    async getAllUsers() : Promise<User[]>{
        return await this.prisma.user.findMany();
    }

    
}
