import {  v2 as cloudinary } from "cloudinary";

import Post from "../models/post.js";
import User from "../models/users.js";
import Notification from "../models/notification.js";



export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;

        const currentUserId = req.user._id.toString();
        const user = await User.findById(currentUserId);
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }

        if(!text && !img) {
            return res.status(400).json({
                success : false,
                message : "Either text or image is required"
            });
        }

        if(img) {
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }

        const newPost = new Post({
            user : currentUserId,
            text,
            img
        });

        await newPost.save();
        return res.status(201).json({
            success : true,
            message : "Post created successfully",
            post : newPost
        });

    }catch(error) {
      
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                success : false,
                message : "Post not found"
            });
        }

        if(post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success : false,
                message : "You are not authorized to delete this post"
            });
        }

        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findOneAndDelete(postId);

        return res.status(200).json({
            success : true,
            message : "Post deleted successfully",
            post : post
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text) {
            return res.status(400).json({
                success : false,
                message : "For comment text is required"
            });
        }

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                success : false,
                message : "Post not found"
            });
        }

        const comment = { user : userId, text };
        post.comments.push(comment);
        await post.save();

        return res.status(200).json({
            success : true,
            message : "comment added successfully"
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const like_or_unlike_post = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                success : false,
                message : "Post not found"
            });
        }

        const userLikedPost = post.likes.includes(userId);

        if(userLikedPost) {
            // unlike the post
            await Post.updateOne({_id : postId}, { $pull : { likes : userId }});
            await User.updateOne({_id : userId}, { $pull : { likedPosts : postId }});

            return res.status(200).json({
                success : true,
                message : "Post unliked successfully"
            });
        }
        else {
            // like the post
            post.likes.push(userId);
            await User.updateOne({_id : userId}, { $push : { likedPosts : postId }});
            await post.save();

            const notification = new Notification({
                from : userId,
                to : post.user,
                type : "like"
            });
            await notification.save();

            return res.status(200).json({
                success : true,
                message : "Post liked successfully"
            });
        }

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const getAllPosts = async (req, res) => {
    try {
        // use populate to get the username and other details instead of just user id
        // With populate , de-select of password required different way
        const posts = await Post.find( {} ).populate({
            path : "user",
            select : "-password -email" 
        })
        .populate({
            path : "comments.user",
            select : "-password -email"
        });

        return res.status(200).json({
            success : true,
            posts : posts
        });
    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}

export const getLikedPost = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }

        // MongoDB internally loops and returns all posts whose _id is in that array
        const likedPosts = await Post.find({ _id : { $in : user.likedPosts }})
        .populate ({
            path : "user",
            select : "-password"
        })
        .populate ({
            path : "comments.user",
            select : "-password"
        });

        return res.status(200).json({
            success : true,
            data : likedPosts
        });
    
    }catch(error) {
        return res.status(500).json ({
            success : false,
            message : error.message
        })
    }
}


export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }

        const following = user.following;  // get the following array
        const followingPosts = await Post.find({user : { $in : following }})
        .sort({ createdAt : -1 })
        .populate  ({
            path : "user",
            select : "-password"
        })
        .populate ({
            path : "comments.user",
            select : "-password"
        });

        res.status(200).json({
            success : true,
            data : followingPosts
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


export const getUserPosts = async (req, res) => {
    try {  
        const { username } = req.params;
    
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });
        }

        const userPosts = await Post.find({ user : user._id })
        .sort({ createdAt : -1 })
        .populate({
            path : "user",
            select : "-password"
        })
        .populate({
            path : "comments.user",
            select : "-password"
        });

        return res.status(200).json({
            success : true,
            data : userPosts
        });

    }catch(error) {
        return res.status(500).json({
            success : false,
            message : error.message
        });
    }
}


