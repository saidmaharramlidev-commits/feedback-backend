import mongoose from "mongoose";
import { DB_URL, NODE_ENV } from "../config/env.js";


if (!DB_URL) {
    throw new Error("Database URL is not defined in environment variables")
}


const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URL)
        console.log(`Connected to MongoDB database successfully in ${NODE_ENV} mode`)

    } catch (error) {
        console.log("Error connecting to database:", error)
        process.exit(1)

    }
}

export default connectToDatabase