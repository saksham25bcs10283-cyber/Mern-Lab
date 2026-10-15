import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);
        
        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        res.status(201).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        const customer = await Customer.findById(customerId).populate({
            path: 'wishlist',
            select: 'name price category image stock'
        });

        res.status(200).json({ 
            success: true, 
            count: customer.wishlist.length,
            wishlist: customer.wishlist 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const customer = await Customer.findById(customerId);

        if (!customer.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);
        const isSaved = customer.wishlist.includes(productId);

        if (isSaved) {
            customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
        } else {
            customer.wishlist.push(productId);
        }
        
        await customer.save();

        res.status(200).json({ 
            success: true, 
            saved: !isSaved,
            message: !isSaved ? "Product added to wishlist" : "Product removed from wishlist"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
