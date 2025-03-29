import { Router } from 'express'
import {
	addToFavourites,
	getAllFavourites,
	removeFromFavourites,
} from '../controllers/favouritesController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/addFavourite', checkAuth, addToFavourites)

//@ts-ignore
router.get('/getAllFavourite', checkAuth, getAllFavourites)

//@ts-ignore
router.post('/removeFromFavourites', checkAuth, removeFromFavourites)

export default router
