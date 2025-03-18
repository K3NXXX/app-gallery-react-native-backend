import { Router } from 'express'
import { addPhoto, getAllPhotos } from '../controllers/photosController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/addPhoto', checkAuth, addPhoto)

//@ts-ignore
router.get('/getAllPhotos', checkAuth, getAllPhotos)

export default router
