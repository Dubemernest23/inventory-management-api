import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { UserRole } from '../types';
import { generateAccessToken, generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/response';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

export const registerUser = async ({ name, email, password }: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken }
  });

  return {
    user,
    ...tokens
  };
};

export const loginUser = async ({ email, password }: LoginUserInput) => {
  if (!email || !password) {
    throw new AppError('Only Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credential(s)', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credential(s)', 401);
  }

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    ...tokens
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { accessToken };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getAllUsersService = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
