import  { PrismaClient} from '@prisma/client';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/checkAuth.js'


const prisma = new PrismaClient();

export const addPhoto = async (req: Request, res: Response) => {
  try {
    const { userId, url } = req.body;

    if (!userId || !url) {
      return res.status(400).json({ message: 'UserId and URL are required.' });
    }

    const photo = await prisma.photo.create({
      data: {
        userId: userId,
        url: url,
      },
    });

    return res.status(201).json({
      message: 'Photo saved successfully!',
      photo,
    });
  } catch (error) {
    console.error('Error saving photo:', error);
    return res.status(500).json({ message: 'Error saving photo.' });
  }
};

export const getAllPhotos = async (req: AuthRequest, res: Response) => {
	try {
	  const userId = req.userId;
  
	  if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  const photos = await prisma.photo.findMany({
		where: { userId: Number(userId) }, 
	  });
  
	  if (photos.length === 0) {
		return res.status(404).json({ message: 'No photos found for this user.' });
	  }
  
	  return res.status(200).json(photos);
	} catch (error) {
	  console.error('Error fetching photos:', error);
	  return res.status(500).json({ message: 'Error fetching photos.' });
	}
  };