import express from 'express'
import mongoose from "mongoose"
import userRouter from './router/userRouter.js'
import productRouter from './router/productRouter.js'
import AuthorizeUser from './lib/jwtMiddleware.js'
import cors from 'cors'
import dotenv from 'dotenv'
import orderRouter from './router/orderRouter.js'
import dashboardRouter from './router/dashboardRouter.js'

dotenv.config()

const mongoURI = process.env.MONGO_URL

async function connectMongoDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");
  } catch (error) {
    console.error("CRITICAL ERROR: Failed to connect to MongoDB.", error.message);
    console.error("Please check your MONGO_URL in the .env file.");
  }
}

connectMongoDB();

const app = express()

app.use( cors() )

app.use(express.json())

app.use(AuthorizeUser)


app.use("/api/users" ,userRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
app.use("/api/dashboard", dashboardRouter)

app.listen(3000,
    ()=>{
        console.log("server is running on port 3000")
    }
)
 