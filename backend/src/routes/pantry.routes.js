import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    addPantryItem,
    getPantryItems,
    getPantryItem,
    updatePantryItem,
    deletePantryItem
} from "../controllers/pantry.controllers.js";

const router = express.Router();

router.route("/")
    .post(protect, addPantryItem)
    .get(protect, getPantryItems);

router.route("/:id")
    .get(protect, getPantryItem)
    .put(protect, updatePantryItem)
    .delete(protect, deletePantryItem);

export default router;