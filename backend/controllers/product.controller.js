import Product from '../models/product.model.js';

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !price || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Invalid price: must be greater than 0" });
        }

        if (stock < 0) {
            return res.status(400).json({ success: false, message: "Invalid stock: cannot be negative" });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Server error creating product" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (category && category !== 'All Categories') {
            query.category = category;
        }

        const products = await Product.find(query);
        
        res.status(200).json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error fetching products" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ success: false, message: "Server error fetching product" });
    }
};
