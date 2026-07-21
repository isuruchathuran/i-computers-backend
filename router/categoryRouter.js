import express from "express";
import { createCategory, getCategories, deleteCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.post("/", createCategory);
categoryRouter.get("/", getCategories);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;
