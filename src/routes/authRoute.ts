import { Router } from "express";
import { getMe, login, register } from '../controllers/authController.ts'
import { checkAuth } from '../middleware/checkAuth.ts'

const router = Router()

//@ts-ignore
router.post('/register', register)
//@ts-ignore
router.post('/login', login)
//@ts-ignore
router.get("/getMe", checkAuth, getMe);

export default router
