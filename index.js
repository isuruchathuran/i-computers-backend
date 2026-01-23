import express from 'express'
import mongoose from "mongoose"
import userRouter from './router/userRouter.js'
import productRouter from './router/productRouter.js'
import AuthorizeUser from './lib/jwtMiddleware.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const mongoURI = process.env.MONGO_URL

async function connectMongoDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");
  } catch (error) {
    console.error("Error Connecting to MongoDB....", error);
  }
}

connectMongoDB();

const app = express()

app.use( cors() )

app.use(express.json())

app.use(AuthorizeUser)


app.use("/api/users" ,userRouter)
app.use("/api/products" ,productRouter )
   

app.listen(3000,
    ()=>{
        console.log("server is running on port 3000")
    }
)
 