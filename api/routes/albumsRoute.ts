import { Router } from 'express'
import {
	addPhotosToAlbum,
	createAlbum,
	deleteAlbum,
	getAllAlbums,
	getOneAlbum,
	removePhotosFromAlbum,
	updateAlbum,
} from '../controllers/albumsController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/createAlbum', checkAuth, createAlbum)

//@ts-ignore
router.get('/getAllAlbums', checkAuth, getAllAlbums)

//@ts-ignore
router.post('/deleteAlbum', checkAuth, deleteAlbum)

//@ts-ignore
router.put('/updateAlbum', checkAuth, updateAlbum)

//@ts-ignore
router.post('/addPhotoToAlbum', checkAuth, addPhotosToAlbum)

//@ts-ignore
// router.post('/getAlbumPhotos', checkAuth, getAlbumPhotos)

//@ts-ignore
router.post('/deletePhotoFromAlbum', checkAuth, removePhotosFromAlbum)

//@ts-ignore
router.post('/getOneAlbum', checkAuth, getOneAlbum)

export default router
