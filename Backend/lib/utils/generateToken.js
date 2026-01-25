import "dotenv/config";
import jwt from "jsonwebtoken";


const generateToken = (userId, res) => {
    const token = jwt.sign( {
        id : userId,
    }, 
    process.env.JWT_SECRET, 
    {
        expiresIn : "15d"
    }
);

res.cookie("jwt", token, {
    maxAge : 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly : true, // accessible only by web server and prevent XSS attacks 
    secure : process.env.NODE_ENV === "production", // send only over HTTPS in production 
    sameSite : "strict", // CSRF protection 
});

};

export default generateToken;