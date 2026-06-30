import express from 'express'
import { getUsers, loginUser, registerUser } from '../controllers/userController.js'
import rateLimit from 'express-rate-limit'

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
})

export const userRouter = express.Router()

// Apply to all routes
userRouter.use(limiter);

userRouter.post("/register", registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/list-user', getUsers);