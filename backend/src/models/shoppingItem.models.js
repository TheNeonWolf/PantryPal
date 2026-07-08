import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0,
        },
        unit: {
            type: String,
            enum: [
                "pcs",
                "g",
                "kg",
                "mL",
                "L",
                "pack",
                "bottle",
                "can",
                "box",
                "bag",
            ],
            default: "pcs",
        },
        isBought: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

const ShoppingItem = mongoose.model("ShoppingItem", shoppingItemSchema);
export default ShoppingItem;