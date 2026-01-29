import "dotenv/config";
import express, { urlencoded } from "express";
import {v2 as cloudinary} from "cloudinary"

import connectToDB from "./config/database.js";

import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";

import cookieParser from "cookie-parser";


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECERT
});

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended : true})); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies (req.cookies.jwt)

connectToDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


