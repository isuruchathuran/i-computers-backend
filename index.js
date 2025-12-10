import express from 'express'
import mongoose from "mongoose"
import userRouter from './router/userRouter.js'
import productRouter from './router/productRouter.js'
import AuthorizeUser from './lib/jwtMiddleware.js'


const mongoURI = "mongodb+srv://admin:1234@cluster0.viide9k.mongodb.net/?appName=Cluster0"

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to MongoDB....")
    } 
).catch(
    ()=>{
        console.log("ErrorConnecting to MongoDB....")
    }
)

const app = express()

app.use(express.json())

app.use(AuthorizeUser)


app.use("/users" ,userRouter)
app.use("/products" ,productRouter )
   

app.listen(3000,
    ()=>{
        console.log("server is running on port 3000")
    }
)

