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

		await prisma.albumPhoto.deleteMany({
			where: { albumId: Number(albumId) },
		})

		await prisma.album.delete({
			where: { id: Number(albumId) },
		})

		return res
			.status(200)
			.json({ message: 'Album and associated photos deleted successfully.' })
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
			return res
				.status(400)
				.json({ message: 'User ID and Album ID are required.' })
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
	  const userId = req.userId;
	  const { albumId, albumIds, photoIds } = req.body;
  
	  if (!userId || (!albumId && !albumIds) || !Array.isArray(photoIds)) {
		return res.status(400).json({ message: 'User ID, albumId/albumIds, and photoIds are required.' });
	  }
  
	  const albumsToAdd = Array.isArray(albumIds) ? albumIds : [albumId];
  
	  const albums = await prisma.album.findMany({
		where: {
		  id: { in: albumsToAdd },
		  userId: Number(userId),
		},
	  });
  
	  if (albums.length !== albumsToAdd.length) {
		return res.status(403).json({ message: 'You do not have access to all of the albums.' });
	  }
  
	  for (let album of albums) {
		// Add photos to the album
		await prisma.albumPhoto.createMany({
		  data: photoIds.map((photoId: number) => ({
			albumId: album.id,
			photoId,
		  })),
		  skipDuplicates: true,
		});
  
		// Check if there is already a cover
		const existingCover = await prisma.albumPhoto.findFirst({
		  where: {
			albumId: album.id,
			isCover: true,
		  },
		});
  
		// If no cover exists and photoIds is not empty, set the first photo as the cover
		if (!existingCover && photoIds.length > 0) {
		  const firstPhotoId = photoIds[0];
  
		  const firstPhoto = await prisma.photo.findUnique({
			where: { id: firstPhotoId },
		  });
  
		  if (firstPhoto) {
			// Update the album's cover image URL
			await prisma.album.update({
			  where: { id: album.id },
			  data: { imageUrl: firstPhoto.url },
			});
  
			// Update the albumPhoto relation to set isCover to true
			await prisma.albumPhoto.updateMany({
			  where: {
				albumId: album.id,
				photoId: firstPhotoId,
			  },
			  data: { isCover: true },
			});
		  }
		}
	  }
  
	  return res.status(200).json({ message: 'Photos successfully added to albums!' });
	} catch (error) {
	  console.error('Error during adding photos to albums:', error);
	  return res.status(500).json({ message: 'Error during adding photos to albums.' });
	}
  };
  
  
  

export const getOneAlbum = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId
		const { albumId } = req.body

		if (!userId || !albumId) {
			return res
				.status(400)
				.json({ message: 'User ID and album ID are required.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
			include: {
				photos: {
					include: {
						photo: true,
					},
				},
			},
		})

		if (!album) {
			return res.status(404).json({ message: 'Album not found.' })
		}

		if (album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'You do not have access to this album.' })
		}

		const photos = album.photos.map(p => p.photo)

		return res.status(200).json({
			album: {
				id: album.id,
				name: album.name,
				description: album.description,
				imageUrl: album.imageUrl,
				photos,
			},
		})
	} catch (error) {
		console.error('Error fetching album:', error)
		return res.status(500).json({ message: 'Error fetching album.' })
	}
}

export const removePhotosFromAlbum = async (
	req: AuthRequest,
	res: Response
) => {
	try {
		const userId = req.userId
		const { albumId, photoId } = req.body

		if (!userId || !albumId || !photoId) {
			return res
				.status(400)
				.json({ message: 'User ID, album ID, and photoId are required.' })
		}

		const album = await prisma.album.findUnique({
			where: { id: Number(albumId) },
		})

		if (!album || album.userId !== Number(userId)) {
			return res
				.status(403)
				.json({ message: 'You do not have access to this album.' })
		}

		// Перевіряємо, чи видаляється обкладинка
		const isCover = await prisma.albumPhoto.findFirst({
			where: {
				albumId: Number(albumId),
				photoId: Number(photoId),
				isCover: true,
			},
		})

		// Видаляємо зв’язок
		const deleteResult = await prisma.albumPhoto.deleteMany({
			where: {
				albumId: Number(albumId),
				photoId: Number(photoId),
			},
		})

		if (deleteResult.count === 0) {
			return res
				.status(404)
				.json({ message: 'No matching photo found in this album.' })
		}

		// Якщо видалене фото було обкладинкою
		if (isCover) {
			// Пробуємо знайти інше фото, яке можна поставити як нову обкладинку
			const anotherPhoto = await prisma.albumPhoto.findFirst({
				where: { albumId: Number(albumId) },
				include: { photo: true },
			})

			if (anotherPhoto?.photo?.url) {
				// Оновлюємо album з новою обкладинкою
				await prisma.album.update({
					where: { id: Number(albumId) },
					data: {
						imageUrl: anotherPhoto.photo.url,
					},
				})

				// Встановлюємо isCover: true для нового фото
				await prisma.albumPhoto.update({
					where: {
						albumId_photoId: {
							albumId: Number(albumId),
							photoId: anotherPhoto.photoId,
						},
					},
					data: { isCover: true },
				})
			} else {
				// Якщо більше немає фото — очищаємо обкладинку
				await prisma.album.update({
					where: { id: Number(albumId) },
					data: {
						imageUrl: '',
					},
				})
			}
		}

		return res.status(200).json({
			message: `Removed photo from album successfully.`,
			removedPhotoId: photoId,
		})
	} catch (error) {
		console.error('Error removing photo from album:', error)
		return res
			.status(500)
			.json({ message: 'Error removing photo from album.' })
	}
}



