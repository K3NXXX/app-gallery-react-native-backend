import { PrismaClient } from '@prisma/client'
import { Response } from 'express'
import { AuthRequest } from '../middleware/checkAuth.js'

const prisma = new PrismaClient()

export const createAlbum = async (req: AuthRequest, res: Response) => {
	try {
		const { name, description, imageUrl, isCover } = req.body
		const userId = req.userId

		if (!userId || !name) {
			return res.status(400).json({ message: 'User ID and name are required.' })
		}

		const album = await prisma.album.create({
			data: {
				userId: Number(userId),
				name,
				description,
				imageUrl,
			},
		})

		return res.status(201).json({
			message: 'Album created successfully!',
			album,
		})
	} catch (error) {
		console.error('Error creating album:', error)
		return res.status(500).json({ message: 'Error creating album.' })
	}
}

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

export const deleteAlbum = async (req: AuthRequest, res: Response) => {
	try {
		const { albumId } = req.body
		const userId = req.userId

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		if (!albumId) {
			return res.status(400).json({ message: 'Album ID is required.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
		})

		if (!album) {
			return res.status(404).json({ message: 'Album not found.' })
		}

		if (album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'You do not have permission to delete this album.' })
		}

		await prisma.album.delete({
			where: { id: Number(albumId) },
		})

		return res.status(200).json({ message: 'Album deleted successfully.' })
	} catch (error) {
		console.error('Error deleting album:', error)
		return res.status(500).json({ message: 'Error deleting album.' })
	}
}

export const updateAlbum = async (req: AuthRequest, res: Response) => {
	try {
		const { albumId, name, description, imageUrl } = req.body
		const userId = req.userId

		if (!userId || !albumId) {
			return res.status(400).json({ message: 'User ID and Album ID are required.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
		})

		if (!album) {
			return res.status(404).json({ message: 'Album not found.' })
		}

		if (album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'You do not have permission to update this album.' })
		}

		// Update the album with the provided data
		const updatedAlbum = await prisma.album.update({
			where: { id: Number(albumId) },
			data: {
				name: name || album.name,
				description: description || album.description,
				imageUrl: imageUrl || album.imageUrl,
			},
		})

		return res.status(200).json({
			message: 'Album updated successfully!',
			album: updatedAlbum,
		})
	} catch (error) {
		console.error('Error updating album:', error)
		return res.status(500).json({ message: 'Error updating album.' })
	}
}

export const addPhotosToAlbum = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId
		const { albumId, photoIds } = req.body 

		if (!userId || !albumId || !Array.isArray(photoIds)) {
			return res
				.status(400)
				.json({ message: 'User ID, album ID та масив photoIds обовʼязкові.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
		})

		if (!album || album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'Ви не маєте доступу до цього альбому.' })
		}

		const photosToAdd = photoIds.map((photoId: number) => ({
			albumId: Number(albumId),
			photoId,
		}))

		await prisma.albumPhoto.createMany({
			data: photosToAdd,
			skipDuplicates: true, 
		})

		return res
			.status(200)
			.json({ message: 'Фотографії успішно додані до альбому!' })
	} catch (error) {
		console.error('Помилка при додаванні фото до альбому:', error)
		return res
			.status(500)
			.json({ message: 'Помилка при додаванні фото до альбому.' })
	}
}

export const getAlbumPhotos = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId
		const { albumId } = req.body

		if (!userId || !albumId) {
			return res
				.status(400)
				.json({ message: 'User ID and album ID required.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
		})

		if (!album || album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'Ви не маєте доступу до цього альбому.' })
		}

		const albumWithPhotos = await prisma.album.findUnique({
			where: { id: Number(albumId) },
			include: {
				photos: {
					include: {
						photo: true, 
					},
				},
			},
		})

		const photos = albumWithPhotos?.photos.map(p => p.photo)

		return res.status(200).json(photos)
	} catch (error) {
		console.error('Помилка при отриманні фото альбому:', error)
		return res
			.status(500)
			.json({ message: 'Не вдалося отримати фотографії альбому.' })
	}
}
