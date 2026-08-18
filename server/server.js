import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'

import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'

import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'

import errorMiddleware from './middlewares/errorMiddleware.js'

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
)

app.use(helmet())

app.use(
  express.json({
    limit: '1mb'
  })
)

app.use(clerkMiddleware())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
})

// Routes
app.get('/', (req, res) => {
  res.send('API Working')
})

app.post('/clerk', clerkWebhooks)

app.post(
  '/stripe', 
  express.raw({ type: 'application/json' }), 
  stripeWebhooks
)

app.use('/api', apiLimiter)

app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

app.use((req, res, next) => {
  const error = new Error(
    `Router not found: ${req.method} ${req.originalUrl}`
  )

  error.statusCode = 404
  error.code = 'ROUTE_NOT_FOUND'

  next(error)

})

app.use(errorMiddleware)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})