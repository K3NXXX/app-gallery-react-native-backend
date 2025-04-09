import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string | number;
}

interface DecodedToken {
  id: string;
}

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (!token) {
    return res.status(401).json({ message: "No access" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res.status(500).json({ message: "Server error: missing JWT secret" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    req.userId = decoded.id; 
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
