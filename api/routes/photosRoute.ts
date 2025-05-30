import { Router } from 'express'
import { addPhoto, deletePhoto, getAllPhotos, renamePhoto, addTagsToPhoto, deleteTagFromPhoto } from '../controllers/photosController.js'
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

//@ts-ignore
router.post('/addTagsToPhoto', checkAuth, addTagsToPhoto)

//@ts-ignore
router.post('/deleteTagFromPhoto', checkAuth, deleteTagFromPhoto)

export default router
