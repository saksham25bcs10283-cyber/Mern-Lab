import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
        }

        if (!decodedToken || !decodedToken.customerId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token payload" });
        }

        const customer = await Customer.findById(decodedToken.customerId).select("-password");

        if (!customer) {
            return res.status(401).json({ success: false, message: "Unauthorized: Customer not found" });
        }

        req.user = customer;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default isAuthenticated;
