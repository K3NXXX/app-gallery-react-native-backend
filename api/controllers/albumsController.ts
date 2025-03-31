import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/checkAuth.js';

const prisma = new PrismaClient();

export const createAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl, isCover } = req.body;
    const userId = req.userId;

    if (!userId || !name) {
      return res.status(400).json({ message: 'User ID and name are required.' });
    }

    const album = await prisma.album.create({
      data: {
        userId: Number(userId),
        name,
        description,
        imageUrl,
	  }
    });

    return res.status(201).json({
      message: 'Album created successfully!',
      album,
    });
  } catch (error) {
    console.error('Error creating album:', error);
    return res.status(500).json({ message: 'Error creating album.' });
  }
};

export const getAllAlbums = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		const albums = await prisma.album.findMany({
			where: { userId: Number(userId) },
		})

		if (albums.length === 0) {
			return res.status(404).json({ message: 'No albums found for this user.' })
		}

		return res.status(200).json(albums)
	} catch (error) {
		console.error('Error fetching albums:', error)
		return res.status(500).json({ message: 'Error fetching albums.' })
	}
}