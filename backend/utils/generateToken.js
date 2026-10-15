import jwt from "jsonwebtoken";

const genToken = (customerId) => {
    const token = jwt.sign({customerId}, process.env.JWT_SECRET, { expiresIn: "15d" });
    return token;
};

export default genToken;