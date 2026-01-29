import User from "../models/users.js";
import bcrypt from "bcryptjs";
import  generateAndSendToken  from "../lib/utils/generateToken.js";


export const signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({
                success : false,
                message : "Invalid email format"
            });
        }

        const userAlreadyExists = await User.findOne({ $or : [{ username : username }, { email : email }] });
        if(userAlreadyExists) {
            return res.status(400).json({
                success : false,
                message : "User already exists, try different username or email"
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10); // salt means random data added to the password before hashing
        const hashedPassword  = await bcrypt.hash(password, salt);  

        const newUser = await User.create({
            username : username,
            password : hashedPassword,
            email : email
        });

        if(newUser) {
            /* 
            - set the token and save it to database
            - This is a helper function that generates a token (usually a JSON Web Token - JWT) to authenticate the user immediately upon registration. 
            - Purpose: Log the user in immediately after sign-up so they don't have to enter their credentials again. 
            */
            generateAndSendToken(newUser._id, res);  // It takes user id and response object
            await newUser.save();

            res.status(201).json({
                success : true,
                message : "New user is created",
                data : newUser,
            });
        }
        else {
            res.status(500).json({
                success : false,
                message : "Some error occurred while creating user",
            });
        }

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordCorrect) {
            return res.status(400).json({
                success : false,
                message : "Invalid username or password"
            });
        }

        generateAndSendToken(user._id, res);

        return res.status(200).json({
            success : true,
            message : "User logged in successfully",
            data : user,
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const logout = async (req, res) => {
    try {
        // setting cookie to expire immediately to delete it
        // Best Practice : You must match the SAME options used when setting the cookie.
        res.cookie("jwt", "", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
        });   

        return res.status(200).json({
            success : true,
            message : "User logged out successfully"
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


// get authenticated users 
// Letter used to check a user is authenticated or not 

export const getMe  = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); // got this from protectedRoute middleware

        return res.status(200).json({
            success : true,
            data : user
        });
    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}