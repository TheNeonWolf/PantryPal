import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./config/db.js";
import pantryRoutes from "./routes/pantry.routes.js";
import shoppingRoutes from "./routes/shopping.routes.js";

dotenv.config();
await connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({
        message: "PantryPal backend is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/shopping", shoppingRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});