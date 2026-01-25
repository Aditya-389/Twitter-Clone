import "dotenv/config";
import User from "../models/users.js";
import jwt from "jsonwebtoken";


export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;        
        if(!token) {
            return res.status(401).json({
                success : false,
                message : "Unauthorized : No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token with the secret key : Synchronously verify given token using a secret or a public key to get a decoded token token
        if(!decoded) {
            return res.status(401).json({
                success : false,
                message : "Unauthorized : Invalid token"
            });
        }

        const user = await User.findById(decoded.id).select("-password"); // return user details expect the password.

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }
        
        req.user = user;
        next();
    }
    catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}