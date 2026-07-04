import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema({
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
    category:{
        type: String,
        enum: [
                "Fruits",
                "Vegetables",
                "Dairy",
                "Meat",
                "Seafood",
                "Grains",
                "Snacks",
                "Drinks",
                "Frozen",
                "Canned",
                "Other",
            ],
        default: "Other",
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    },
    unit: {
        type: String,
        enum: [
            "pcs",
           "g",
            "kg",
            "mL",
           "L",
            "oz",
            "lb",
            "pack",
            "bottle",
            "can",
            "box",
            "bag"
        ],
        default: "pcs"
    },
    minimumQuantity: {
        type: Number,
        default: 1,
        min: 0
    },
    location: {
        type: String,
        enum: ["Fridge", "Freezer", "Pantry", "Other"],
        default: "Pantry"
    },
    customLocation: {
        type: String,
        trim: true,
        default: "",
    },
    expiryDate: {
        type: Date,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    }
}, {timestamps: true});

pantryItemSchema.index({ user: 1 });
pantryItemSchema.index({ expiryDate: 1 });
pantryItemSchema.index({ name: "text" });

const PantryItem = mongoose.model("PantryItem", pantryItemSchema);
export default PantryItem;