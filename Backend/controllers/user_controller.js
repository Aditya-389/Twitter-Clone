import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary"

import User from "../models/users.js";
import Notification from "../models/notification.js";


export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password ");
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }

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

export const follow_unfollow_user = async (req, res) => {
    try {
        const { id } = req.params; // id of the user to be followed/unfollowed
        const userToModify = await User.findById(id);  // user to be followed/unfollowed
        const currentUser = await User.findById(req.user._id); 

        console.log(id);
        console.log(req.user._id);
 

        if(id === req.user.id) {
            return res.status(400).json({
                success : false,
                message : "You cannot follow/unfollow yourself"
            });
        }

        if(!userToModify || !currentUser) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            // unfollow the user
            await User.findByIdAndUpdate(id, { $pull : { followers : req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull : { following : id } });

            res.status(200).json({
                success : true,
                message : "User unfollowed successfully"
            });
        }
        else {
            // Follow the user 
            await User.findByIdAndUpdate(id, { $push : { followers : req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push : { following : id } });


            // send notification to user
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            });
            await newNotification.save();

            res.status(200).json({
                success : true,
                message : "User follow successfully"
            });

            

        }


    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const getSuggestedUsers = async(req, res) => {
    try {

        // Get users I already follow
        const currentUserId = req.user._id;
        /*
            .lean() tells Mongoose:
            - “Don’t give me heavy Mongoose objects. Just give me plain JavaScript objects.”
            - Perfect for read-only APIs
        */
        const { following } = await User.findById(currentUserId)
        .select("following")
        .lean();

        // suggest user except which i aleready follows, Also those suggested users does not include passward
        const suggestedUsers = await User.find({
            // $ne = not equal
            // nin = not in 
            // Query : suggest all the users that is not equals to currentUserId(me) and not in my following list. 
        _id: {
            $ne: currentUserId,
            $nin: following
        }
        })
        .select("-password")
        .limit(4)
        .lean();

        return res.status(200).json({
            success: true,
            data: suggestedUsers
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const updateProfile = async (req, res) => {
    const { username, currentPassword, newPassword, email, bio, links } = req.body;
    let { profileImg, coverImg } = req.body; // these fields can change that's why use let

    const currentUserId = req.user._id;
    try {
        const user = await User.findById(currentUserId);
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }

        if((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({
                success : false,
                message : "Both current and new password are required"
            });
        }

        if(currentPassword && newPassword) {
            // match the current with exisiting db password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) {
                return res.status(400).json({
                    success : false,
                    message : "current password is incorrect"
                });
            }

            // Then update the current password with new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            if(user.profileImg) {
                // if user already hass profile image tgen delete the first image before uploading new one
                // For that cloudinary image id is required
                // Eg : https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg, then sample is the image id 
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResponse.secure_url;
        }

        if(coverImg) {
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }

            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }

        // update fields
        user.username = username ?? user.username;
        user.email = email ?? user.email;
        user.bio = bio ?? user.bio;
        user.links = links ?? user.links;
    
        await user.save();

        // exclude passoword form respose
        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            success: true,
            data: userObj
        });


    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }

}