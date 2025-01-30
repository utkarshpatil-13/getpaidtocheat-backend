import { AdminService } from '../services/admin.services';
import { AdminRepository } from '../repositories/admin.repositories';

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);

export class AdminController {

}