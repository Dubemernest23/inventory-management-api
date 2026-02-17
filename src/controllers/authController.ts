import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { generateTokenPair, verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/response';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 400, 'User with this email already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    sendSuccess(res, 201, 'User registered successfully', {
      user,
      ...tokens
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error registering user');
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error logging in');
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, 400, 'Refresh token is required');
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      sendError(res, 401, 'Invalid or expired refresh token');
      return;
    }

    // Find user and verify stored refresh token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.refreshToken !== refreshToken) {
      sendError(res, 401, 'Invalid refresh token');
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error refreshing token');
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    // Clear refresh token
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null }
    });

    sendSuccess(res, 200, 'Logged out successfully', null);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error logging out');
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, 'Profile retrieved successfully', { user });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching profile');
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    sendSuccess(res, 200, 'Users retrieved successfully', { users, count: users.length });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching users');
  }
};
