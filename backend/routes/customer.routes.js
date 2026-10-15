import express from "express";
import { registerCustomer, loginCustomer, logoutCustomer, getMe } from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

// register customer
customerRoutes.post('/register', registerCustomer);

// login customer
customerRoutes.post('/login', loginCustomer);

// logout customer
customerRoutes.post('/logout', isAuthenticated, logoutCustomer);

// get logged in customer profile
customerRoutes.get('/me', isAuthenticated, getMe);

export default customerRoutes;
