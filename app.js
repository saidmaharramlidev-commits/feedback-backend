import express from 'express';
import { PORT } from './config/env.js';
import userRouter from './routes/user.route.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import feedbackRouter from './routes/feedback.route.js';
import followRouter from './routes/follow.route.js';
import { clerkMiddleware } from '@clerk/express';

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/users/sync', userRouter)
app.use(arcjetMiddleware)
app.use(clerkMiddleware())


app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to Feedback App'
    })
})


app.use('/users', userRouter)
app.use("/users", followRouter)
app.use('/feedbacks', feedbackRouter)


app.use(errorMiddleware)

app.listen(PORT || 3000, async () => {
    console.log(`Server is running on port http://localhost:${PORT || 3000}`)

    await connectToDatabase()
})