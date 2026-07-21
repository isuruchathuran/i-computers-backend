import express from "express"
import { changeUserPassword, createUser,getUser,loginUser, updateUserProfile, getAllUsers, toggleBlockUser, deleteUser } from "../controllers/userController.js"

const userRouter = express.Router()
    userRouter.post("/",createUser) 
    userRouter.post("/login", loginUser)
    userRouter.post("/update-password", changeUserPassword)
    userRouter.put("/", updateUserProfile)
    userRouter.get("/profile", getUser)
    userRouter.get("/all", getAllUsers)
    userRouter.put("/block/:email", toggleBlockUser)
    userRouter.delete("/:email", deleteUser)
export default userRouter 
