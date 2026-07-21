import express from "express";
import { getCart, updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.get("/", getCart);
cartRouter.put("/", updateCart);

export default cartRouter;
