import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/checkAuth.ts'

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const isUsed = await prisma.user.findUnique({
      where: { email },
    });
    if (isUsed) {
      return res.status(400).json({ message: 'Such a user already exists' });
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(7);
    const hashPassword = bcrypt.hashSync(password, salt);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email,
        password: hashPassword,
      },
    });

    // Ensure the JWT_SECRET is defined before using it
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not defined in environment variables' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, jwtSecret, {
      expiresIn: '30d',
    });

    // Respond with the user and token
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
  
	  // Знайти користувача в базі
	  const user = await prisma.user.findUnique({
		where: { email },
	  });
  
	  if (!user) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
  
	  // Перевірити правильність пароля
	  const isPasswordCorrect = await bcrypt.compare(password, user.password);
	  if (!isPasswordCorrect) {
		return res.status(401).json({ message: 'Invalid email or password' });
	  }
  
	  // Переконатися, що JWT_SECRET встановлено
	  const jwtSecret = process.env.JWT_SECRET;
	  if (!jwtSecret) {
		return res.status(500).json({ message: 'JWT_SECRET is not defined in environment variables' });
	  }
  
	  // Генерація JWT токена
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
  
	  // Конвертуємо userId у number, якщо він передається як string
	  const numericUserId = Number(userId);
	  if (isNaN(numericUserId)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	  }
  
	  // Шукаємо користувача в базі
	  const user = await prisma.user.findUnique({
		where: { id: numericUserId }, // Prisma очікує int
	  });
  
	  if (!user) {
		return res.status(404).json({ message: 'No such user exists' });
	  }
  
	  // Перевіряємо, чи є JWT_SECRET
	  const jwtSecret = process.env.JWT_SECRET;
	  if (!jwtSecret) {
		return res.status(500).json({ message: 'JWT_SECRET is not defined' });
	  }
  
	  // Генеруємо новий токен
	  const token = jwt.sign({ id: user.id }, jwtSecret, {
		expiresIn: '30d',
	  });
  
	  return res.status(200).json({ user, token, message: 'User is authenticated' });
	} catch (error) {
	  console.error(error);
	  return res.status(500).json({ message: 'No access' });
	}
  };