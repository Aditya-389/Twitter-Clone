import "dotenv/config";
import mongoose from "mongoose";

export const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Mongodb connection successfull");
    }catch(error) {
        console.log("Database connection error : ", error);
        process.exit(1);
    }
}


export default connectToDB;