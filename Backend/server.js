import "dotenv/config";
import express, { urlencoded } from "express";
import connectToDB from "./config/database.js";
import authRoutes from "./routes/auth_routes.js";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended : true})); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies (req.cookies.jwt)

connectToDB();

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


