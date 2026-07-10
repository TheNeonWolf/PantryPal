import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existinguser = await User.findOne({ email });

        if(existinguser){
            return res.status(400).json({message: "User already exists"});
        }

        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

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

export {
    registerUser,
    loginUser,
    getMe,
    logoutUser
};
