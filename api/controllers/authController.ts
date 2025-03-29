import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/checkAuth.js'

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, avatar } = req.body;

    const isUsed = await prisma.user.findUnique({
      where: { email },
    });
    if (isUsed) {
      return res.status(400).json({ message: 'Such a user already exists' });
    }

    const salt = bcrypt.genSaltSync(7);
    const hashPassword = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email,
        password: hashPassword,
		avatar: avatar,
      },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not defined in environment variables' });
    }

    const token = jwt.sign({ id: newUser.id }, jwtSecret, {
      expiresIn: '30d',
    });

    return res.status(200).json({
      newUser,
      token,
      message: 'Registration was successful',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Registration failed' });
  }
};


export const login = async (req: Request, res: Response): Promise<Response> => {
	try {
	  const { email, password } = req.body;
	  const user = await prisma.user.findUnique({
		where: { email },
	  });
  
	  if (!user) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
  
	  const isPasswordCorrect = await bcrypt.compare(password, user.password);
	  if (!isPasswordCorrect) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
  
	  const jwtSecret = process.env.JWT_SECRET;
	  if (!jwtSecret) {
		return res.status(500).json({ message: 'JWT_SECRET is not defined in environment variables' });
	  }
  
	  const token = jwt.sign({ id: user.id }, jwtSecret, {
		expiresIn: '30d',
	  });
  
	  return res.status(200).json({
		user,
		token,
		message: 'Authorization was successful',
	  });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'Authorization failed' });
	}
  };

  export const getMe = async (req: AuthRequest, res: Response): Promise<Response> => {
	try {
	  const userId = req.userId;
  
	  if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  const numericUserId = Number(userId);
	  if (isNaN(numericUserId)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	  }
  
	  const user = await prisma.user.findUnique({
		where: { id: numericUserId }, 
	  });
  
	  if (!user) {
		return res.status(404).json({ message: 'No such user exists' });
	  }
  
	  const jwtSecret = process.env.JWT_SECRET;
	  if (!jwtSecret) {
		return res.status(500).json({ message: 'JWT_SECRET is not defined' });
	  }
  
	  const token = jwt.sign({ id: user.id }, jwtSecret, {
		expiresIn: '30d',
	  });
  
	  return res.status(200).json({ user, token, message: 'User is authenticated' });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'No access' });
	}
  };

  export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
	try {
	  const { name, email, password, currentPassword } = req.body;
	  const userId = req.userId;
  
	  if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  const numericUserId = Number(userId);
	  if (isNaN(numericUserId)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	  }
  
	  const user = await prisma.user.findUnique({
		where: { id: numericUserId },
	  });
  
	  if (!user) {
		return res.status(404).json({ message: 'No such user exists' });
	  }
  
	  if (!currentPassword) {
		return res.status(400).json({ message: 'Current password is required' });
	  }
  
	  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
	  if (!isCurrentPasswordValid) {
		return res.status(401).json({ message: 'Incorrect current password' });
	  }
  
	  let updatedPassword = user.password;
	  if (password) {
		const salt = bcrypt.genSaltSync(7);
		updatedPassword = bcrypt.hashSync(password, salt);
	  }
  
	  const updatedUser = await prisma.user.update({
		where: { id: numericUserId },
		data: {
		  name: name || user.name, 
		  email: email || user.email, 
		  password: updatedPassword, 
		},
	  });
  
	  const jwtSecret = process.env.JWT_SECRET;
	  if (!jwtSecret) {
		return res.status(500).json({ message: 'JWT_SECRET is not defined in environment variables' });
	  }
  
	  const token = jwt.sign({ id: updatedUser.id }, jwtSecret, {
		expiresIn: '30d',
	  });
  
	  return res.status(200).json({
		user: updatedUser,
		token,
		message: 'User data updated successfully',
	  });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'Failed to update user data' });
	}
  };
  

  export const updateAvatar = async (req: AuthRequest, res: Response): Promise<Response> => {
	try {
	  const { url } = req.body;
	  const userId = req.userId;
  
	  if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  const numericUserId = Number(userId);
	  if (isNaN(numericUserId)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	  }
  
	  const user = await prisma.user.findUnique({
		where: { id: numericUserId },
	  });
  
	  if (!user) {
		return res.status(404).json({ message: 'No such user exists' });
	  }
  
	  if (!url) {
		return res.status(400).json({ message: 'Avatar URL is required' });
	  }
  
	  const updatedUser = await prisma.user.update({
		where: { id: numericUserId },
		data: { avatar: url },
	  });
  
	  return res.status(200).json({
		user: updatedUser,
		message: 'Avatar updated successfully',
	  });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'Failed to update avatar' });
	}
  };
  

  export const deleteAvatar = async (req: AuthRequest, res: Response): Promise<Response> => {
	try {
	  const userId = req.userId;
  
	  if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  const numericUserId = Number(userId);
	  if (isNaN(numericUserId)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	  }
  
	  const user = await prisma.user.findUnique({
		where: { id: numericUserId },
	  });
  
	  if (!user) {
		return res.status(404).json({ message: 'No such user exists' });
	  }
  
	  const updatedUser = await prisma.user.update({
		where: { id: numericUserId },
		data: { avatar: '' },
	  });
  
	  return res.status(200).json({
		user: updatedUser,
		message: 'Avatar deleted successfully',
	  });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'Failed to delete avatar' });
	}
  };