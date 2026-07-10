import PantryItem from "../models/pantryItem.models.js";

function capitalize(str) {
    return str
        .trim()
        .split(" ")
        .filter(word => word.length > 0)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ");
}

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
            name: capitalize(name),
            category,
            quantity,
            unit,
            minimumQuantity,
            location,
            customLocation,
            expiryDate,
            imageUrl,
        });

        return res.status(201).json({
            message: "Pantry item has been added successfully",
            item
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};

const getPantryItems = async (req, res) => {
    try {
        const items = await PantryItem.find({ user: req.user._id }).sort({
            expiryDate: 1
        });
        return res.status(200).json({
            items
        });
    } catch (error) {
        return res.status(500).json({
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

        return res.status(200).json({ item });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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

        return res.status(200).json({
            message: "Pantry item updated successfully",
            item
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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

        return res.status(200).json({
            message: "Pantry item deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export {
    addPantryItem,
    getPantryItems,
    getPantryItem,
    updatePantryItem,
    deletePantryItem
};