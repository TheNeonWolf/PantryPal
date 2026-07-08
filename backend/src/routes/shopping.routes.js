import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    addShoppingItem,
    getShoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
} from "../controllers/shopping.controllers.js";

const router = express.Router();

router.route("/")
    .post(protect, addShoppingItem)
    .get(protect, getShoppingItems);

router.route("/:id")
    .put(protect, updateShoppingItem)
    .delete(protect, deleteShoppingItem);

export default router;