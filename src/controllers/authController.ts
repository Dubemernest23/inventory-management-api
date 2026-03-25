import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  getAllUsersService,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser
} from '../services/authService';
import {sendError, sendSuccess } from '../utils/response';
import { handleControllerError } from '../__helper__/handleControllerError';


export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await registerUser(req.body);

    sendSuccess(res, 201, 'User registered successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error registering user');
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await loginUser(req.body);

    sendSuccess(res, 200, 'Login successful', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error logging in');
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const data = await refreshUserAccessToken(refreshToken);

    sendSuccess(res, 200, 'Token refreshed successfully', {
      ...data
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error refreshing token');
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    await logoutUser(req.user.id);

    sendSuccess(res, 200, 'Logged out successfully', null);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error logging out');
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const user = await getUserProfile(req.user.id);

    sendSuccess(res, 200, 'Profile retrieved successfully', { user });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching profile');
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService();

    sendSuccess(res, 200, 'Users retrieved successfully', { users, count: users.length });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching users');
  }
};
