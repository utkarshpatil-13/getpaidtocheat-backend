import { Context } from 'hono';
import { ApiError } from '../utils/apierror';
import { ApiResponse } from '../utils/apiresponse';
import { asyncHandler } from '../utils/asynchandler';
import userService from '../services/user.services';

class UserController {

    getAllUsers = asyncHandler(async (c: Context) => {
        const users = await userService.getAllUsers();
        return c.json(new ApiResponse(200, users, 'Users fetched successfully'));
      });

  getUserById = asyncHandler(async (c: Context) => {
    const id = c.req.param('id');
    const user = await userService.getUserById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return c.json(new ApiResponse(200, user, 'User fetched successfully'));
  });

  getUser = asyncHandler(async (c : Context) => {
    const user = c.get('user');

    if(!user){
      throw new ApiError(404, 'User not found');
    }
  
    return c.json(new ApiResponse(201, user, 'User data verified!'));
  });

  updateUser = asyncHandler(async (c: Context) => {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    const updatedUser = await userService.updateUser(id, updateData);

    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }

    return c.json(new ApiResponse(200, updatedUser, 'User updated successfully'));
  });

  deleteUser = asyncHandler(async (c: Context) => {
    const id = c.req.param('id');
    await userService.deleteUser(id);
    return c.json(new ApiResponse(200, null, 'User deleted successfully'));
  });
}

export default new UserController();
