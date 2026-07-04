import PantryItem from "../models/pantryItem.models.js";

const addPantryItem = async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            unit,
            minimumQuantity,
            location,
            customLocation,
            expiryDate,
            imageUrl,
        } = req.body;

        const item = await PantryItem.create({
            user: req.user._id,
            name,
            category,
            quantity,
            unit,
            minimumQuantity,
            location,
            customLocation,
            expiryDate,
            imageUrl,
        });

        res.status(201).json({
            message: "Pantry item has been added successfully",
            item
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

const getPantryItems = async (req, res) => {
    try {
        const items = await PantryItem.find({ user: req.user._id }).sort({
            expiryDate: 1
        });
        res.status(200).json({
            items
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getPantryItem = async (req, res) => {
    try {
        const item = await PantryItem.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if(!item){
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({ item });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePantryItem = async (req, res) => {
    try {
        const item = await PantryItem.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!item){
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({
            message: "Pantry item updated successfully",
            item
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePantryItem = async (req, res) => {
    try {
        const item = await PantryItem.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!item) {
            return res.status(404).json({ message: "Pantry item not found" });
        }

        res.status(200).json({
            message: "Pantry item deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    addPantryItem,
    getPantryItems,
    getPantryItem,
    updatePantryItem,
    deletePantryItem
};