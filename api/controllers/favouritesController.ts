import { PrismaClient } from '@prisma/client'
import { Response } from 'express'
import { AuthRequest } from '../middleware/checkAuth.js'

const prisma = new PrismaClient()

export const addToFavourites = async (req: AuthRequest, res: Response) => {
	try {
		const { photoId } = req.body
		const userId = req.userId

		if (!userId || !photoId) {
			return res
				.status(400)
				.json({ message: 'UserId and PhotoId are required.' })
		}

		const existingFavourite = await prisma.favourite.findUnique({
			where: {
				userId_photoId: {
					userId: Number(userId),
					photoId: photoId,
				},
			},
		})

		if (existingFavourite) {
			return res
				.status(400)
				.json({ message: 'This photo is already in your favourites.' })
		}

		const newFavourite = await prisma.favourite.create({
			data: {
				userId: Number(userId),
				photoId: photoId,
			},
		})

		return res.status(201).json({
			message: 'Photo added to favourites successfully!',
			favourite: newFavourite,
		})
	} catch (error) {
		console.error('Error adding photo to favourites:', error)
		return res
			.status(500)
			.json({ message: 'Error adding photo to favourites.' })
	}
}

export const getAllFavourites = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		const favouritePhotos = await prisma.favourite.findMany({
			where: { userId: Number(userId) },
			include: {
				photo: {
					select: {
						id: true,   
						name: true,
						url: true,
					},
				},
			},
		})

		if (favouritePhotos.length === 0) {
			return res.status(404).json([])  
		}

		const photos = favouritePhotos.map(fav => ({
			id: fav.photo.id,  
			name: fav.photo.name,
			url: fav.photo.url,
		}))

		return res.status(200).json(photos)
	} catch (error) {
		console.error('Error fetching photos:', error)
		return res.status(500).json({ message: 'Error fetching photos.' })
	}
}

export const removeFromFavourites = async (req: AuthRequest, res: Response) => {
	try {
		const { photoId } = req.body
		const userId = req.userId

		if (!userId || !photoId) {
			return res
				.status(400)
				.json({ message: 'UserId and PhotoId are required.' })
		}

		const existingFavourite = await prisma.favourite.findUnique({
			where: {
				userId_photoId: {
					userId: Number(userId),
					photoId: photoId,
				},
			},
		})

		if (!existingFavourite) {
			return res
				.status(404)
				.json({ message: 'This photo is not in your favourites.' })
		}

		await prisma.favourite.delete({
			where: {
				userId_photoId: {
					userId: Number(userId),
					photoId: photoId,
				},
			},
		})

		return res.status(200).json({
			message: 'Photo removed from favourites successfully!',
		})
	} catch (error) {
		console.error('Error removing photo from favourites:', error)
		return res
			.status(500)
			.json({ message: 'Error removing photo from favourites.' })
	}
}

