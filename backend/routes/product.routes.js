import express from 'express';
import { createProduct, getAllProducts, getProductById } from '../controllers/product.controller.js';

const router = express.Router();

// POST /products - Create a new product
router.post('/', createProduct);

// GET /products - Get all products (with optional search and category filters)
router.get('/', getAllProducts);

// GET /products/:id - Get a single product by ID
router.get('/:id', getProductById);

export default router;
