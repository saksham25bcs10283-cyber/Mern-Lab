import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const wishlistRoutes = express.Router();

// all wishlist routes are protected
wishlistRoutes.use(isAuthenticated);
wishlistRoutes.post('/:productId', addToWishlist);
wishlistRoutes.get('/', getWishlist);
wishlistRoutes.delete('/:productId', removeFromWishlist);
wishlistRoutes.patch('/:productId/toggle', toggleWishlist);

export default wishlistRoutes;
