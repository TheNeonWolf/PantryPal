import ShoppingItem from "../models/shoppingItem.models.js";

const addShoppingItem = async (req, res) => {
    try {
        const { name, quantity, unit } = req.body;

        const item = await ShoppingItem.create({
            user: req.user._id,
            name: name.trim(),
            quantity,
            unit
        });

        res.status(201).json({
            message: "Shopping item added successfully",
            item
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const getShoppingItems = async (req, res) => {
    try {
        const items = await ShoppingItem.find({ user: req.user._id }).sort({
            createdAt: -1
        });

        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateShoppingItem = async (req, res) => {
    try {
        const item = await ShoppingItem.findOneAndUpdate(
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

        if (!item) {
            return res.status(404).json({ message: "Shopping item not found" });
        }

        res.status(200).json({
            message: "Shopping item updated successfully",
            item,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteShoppingItem = async (req, res) => {
    try {
        const item = await ShoppingItem.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!item) {
            return res.status(404).json({ message: "Shopping item not found" });
        }

        res.status(200).json({
            message: "Shopping item deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export {
    addShoppingItem,
    getShoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
};