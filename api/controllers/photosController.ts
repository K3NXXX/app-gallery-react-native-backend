import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AuthRequest } from '../middleware/checkAuth.js'

const prisma = new PrismaClient()

export const addPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    const userId = req.userId;

    if (!userId || !url) {
      return res.status(400).json({ message: 'UserId and URL are required.' });
    }

    const generatedName = `Photo_${uuidv4()}`;

    const photo = await prisma.photo.create({
      data: {
        userId: Number(userId),
        url: url,
        name: generatedName, 
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
		const userId = req.userId

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		const photos = await prisma.photo.findMany({
			where: { userId: Number(userId) },
		})

		if (photos.length === 0) {
			return res.status(404).json({ message: 'No photos found for this user.' })
		}

		return res.status(200).json(photos)
	} catch (error) {
		console.error('Error fetching photos:', error)
		return res.status(500).json({ message: 'Error fetching photos.' })
	}
}

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { photoId } = req.body; 
    const userId = req.userId;

    if (!photoId) {
      return res.status(400).json({ message: 'Photo ID is required.' });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: Number(photoId) }, 
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    if (photo.userId !== Number(userId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this photo.' });
    }

    await prisma.favourite.deleteMany({
      where: { photoId: Number(photoId) },
    });

    await prisma.photo.delete({
      where: { id: Number(photoId) },
    });

    return res.status(200).json({ message: 'Photo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return res.status(500).json({ message: 'Error deleting photo.' });
  }
}

export const renamePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { photoId, newName } = req.body;
    const userId = req.userId;

    if (!photoId) {
      return res.status(400).json({ message: 'Photo ID is required.' });
    }

    if (!newName) {
      return res.status(400).json({ message: 'Photo name is required.' });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: Number(photoId) },
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found.' });
    }

    if (photo.userId !== Number(userId)) {
      return res.status(403).json({ message: 'You are not authorized to rename this photo.' });
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id: Number(photoId) },
      data: { name: newName },
    });

    return res.status(200).json({
      message: 'Photo renamed successfully!',
      photo: updatedPhoto,
    });
  } catch (error) {
    console.error('Error renaming photo:', error);
    return res.status(500).json({ message: 'Error renaming photo.' });
  }
};

