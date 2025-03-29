import { Router } from 'express'
import { addPhoto, deletePhoto, getAllPhotos, renamePhoto } from '../controllers/photosController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/addPhoto', checkAuth, addPhoto)

//@ts-ignore
router.get('/getAllPhotos', checkAuth, getAllPhotos)

//@ts-ignore
router.post('/deletePhoto', checkAuth, deletePhoto)

//@ts-ignore
router.put('/renamePhoto', checkAuth, renamePhoto)

export default router
