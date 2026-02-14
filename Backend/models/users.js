import mongoose from 'mongoose';

const  UserSchema = new mongoose.Schema({
    username :{
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
        minLength : 0
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId, // referencing the user who follows
            ref : "User",
            default : []
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId, // referencing the user who is being followed
            ref : "User",
            default : []
        }
    ],
    profileImg : {
        type : String,
        default : ""
    },
    coverImg : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    links : {
        type : String,
        default : "" 
    },
    likedPosts : [
        {
            type : mongoose.Schema.Types.ObjectId, // referencing the post that is liked
            ref : "Post",
            default : []
        }
    ]

}, { timestamps : true });


const User = mongoose.model("User", UserSchema);
export default User;