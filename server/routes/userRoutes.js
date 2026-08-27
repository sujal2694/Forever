// routes/userRoute.js
import express from 'express'
import { getUserById, getUsers, getProfile, loginUser, registerUser } from '../controllers/userController.js'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from '../middleware/nameAuth.js'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
})

export const userRouter = express.Router()

userRouter.use(limiter);

userRouter.post("/register", registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', authMiddleware, getProfile);
userRouter.get('/list-users', getUsers);
userRouter.get('/:id', getUserById);