import express from "express";
import { addToCart, getCart, updateQuantity, removeFromCart } from "../controllers/cart.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const cartRoutes = express.Router();

cartRoutes.use(isAuthenticated);

cartRoutes.post('/:productId', addToCart);
cartRoutes.get('/', getCart);
cartRoutes.patch('/:productId', updateQuantity);
cartRoutes.delete('/:productId', removeFromCart);

export default cartRoutes;
