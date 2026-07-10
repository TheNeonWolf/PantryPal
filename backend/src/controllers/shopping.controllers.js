import ShoppingItem from "../models/shoppingItem.models.js";

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

const addShoppingItem = async (req, res) => {
    try {
        const { name, quantity, unit } = req.body;
        const itemName = capitalize(name);

        const existingItem = await ShoppingItem.findOne({
            user: req.user._id,
            name: itemName,
            unit,
            isBought: false,
        });

        if (existingItem){
            existingItem.quantity += Number(quantity) || 1;

            await existingItem.save();

            return res.status(200).json({
                message: "Shopping item quantity has been updated successfully",
                item: existingItem
            });

        }

        const item = await ShoppingItem.create({
            user: req.user._id,
            name: itemName,
            quantity,
            unit,
        });

        return res.status(201).json({
            message: "Shopping item added successfully",
            item
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const getShoppingItems = async (req, res) => {
    try {
        const items = await ShoppingItem.find({ user: req.user._id }).sort({
            createdAt: -1
        });

        return res.status(200).json({ items });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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

        return res.status(200).json({
            message: "Shopping item updated successfully",
            item,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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

        return res.status(200).json({
            message: "Shopping item deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export {
    addShoppingItem,
    getShoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
};