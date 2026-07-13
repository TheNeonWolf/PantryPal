import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import sendEmail from "../utils/sendEmail.js";
import welcomeEmail from "../utils/welcomeEmail.js";
import PantryItem from "../models/pantryItem.models.js";
import ShoppingItem from "../models/shoppingItem.models.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existinguser = await User.findOne({
            email: normalizedEmail
        });

        if(existinguser){
            return res.status(400).json({message: "User already exists"});
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password
        });

        const token = generateToken(user._id);
        const emailContent = welcomeEmail(user.name);

        try {
            await sendEmail({
                to: user.email,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
            });
        } catch (error) {
            console.error(
                "Welcome email could not be sent:",
                error.message
            );
        }

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if(!isPasswordCorrect) {
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

const logoutUser = async (req, res) => {
    return res.status(200).json({
        message: "Logout successful"
    });
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await Promise.all([
            PantryItem.deleteMany({ user: userId }),
            ShoppingItem.deleteMany({ user: userId })
        ]);

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({
            message: "Could not delete account"
        });
    }
};

export {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    deleteAccount
};
