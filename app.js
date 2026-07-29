import './config/env.js'
import express from 'express';
import { PORT } from './config/env.js';
import userRouter from './routes/user.route.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import feedbackRouter from './routes/feedback.route.js';
import followRouter from './routes/follow.route.js';
import { clerkMiddleware } from '@clerk/express';
import replyRouter from "./routes/reply.route.js";
import redirectRouter from "./routes/redirect.route.js";
import streakRouter from "./routes/streak.route.js";



const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(clerkMiddleware())
app.use(arcjetMiddleware)

app.get('/', (req, res) => {
    res.send({ message: 'Welcome to Feedback App' })
})

app.use('/users', userRouter)    // ← just one registration
app.use("/users", followRouter)
app.use('/feedbacks', feedbackRouter)
app.use("/replies", replyRouter);
app.use("/u", redirectRouter);
app.use("/streaks", streakRouter);


app.use(errorMiddleware)

app.listen(PORT || 3000, async () => {
    console.log(`Server is running on port http://localhost:${PORT || 3000}`)

    await connectToDatabase()
})