import bcrypt from "bcryptjs";
import Customer from "../models/customer.model.js";
import genToken from "../utils/generateToken.js";

const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000
};

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone || !fullName.trim() || !email.trim() || !phone.trim()) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const emailExists = await Customer.findOne({ email: email.toLowerCase().trim() });
        if (emailExists) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await Customer.create({
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone,
            }
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, customer.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = genToken(customer._id);

        res.cookie("token", token, cookieOption);

        return res.status(200).json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const customer = req.user;
        if (!customer) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        return res.status(200).json({
            _id: customer._id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
        });
    } catch (error) {
        console.error("Get Profile Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const logoutCustomer = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
