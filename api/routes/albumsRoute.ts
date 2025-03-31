import { Router } from 'express'
import { createAlbum, getAllAlbums } from '../controllers/albumsController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/createAlbum', checkAuth, createAlbum)


//@ts-ignore
router.get('/getAllAlbums', checkAuth, getAllAlbums)

export default router
