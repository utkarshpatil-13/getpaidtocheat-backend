import { User } from '@prisma/client';
import { IAdminService } from '../interfaces/admin/IAdminService';
import { AdminRepository } from '../repositories/admin.repositories';
import YouTubeApiClient from '../utils/youtubeapi.client.utils';
import { ApiError } from '@utils/apierror';
import userRepositoryInstance from '../repositories/user.repositories';

export class AdminService implements IAdminService {
  private adminRepository: AdminRepository;

  constructor(adminRepository: AdminRepository) {
    this.adminRepository = adminRepository;
  }

  async getAllUsers() : Promise<User[]>{
    try{
      return await userRepositoryInstance.getAllUsers();
    }
    catch(error){
      console.error('Error in getting all users');
      throw new ApiError(400, 'Failed to retrieve all users');
    }
  }

}
