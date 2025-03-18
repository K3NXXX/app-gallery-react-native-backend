import { Router } from 'express'
import {
	getMe,
	login,
	register,
	updateUser,
} from '../controllers/authController.js'
import { checkAuth } from '../middleware/checkAuth.js'

const router = Router()

//@ts-ignore
router.post('/register', register)
//@ts-ignore
router.post('/login', login)
//@ts-ignore
router.get('/getMe', checkAuth, getMe)
//@ts-ignore
router.post('/updateUser', checkAuth, updateUser)

export default router
