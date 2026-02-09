import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import { 
    createPost, 
    deletePost, 
    commentOnPost, 
    like_or_unlike_post,
    getAllPosts,
    getLikedPost,
    getFollowingPosts,
    getUserPosts
} from "../controllers/post_controller.js";

const router = express.Router();


router.get("/all", protectedRoute, getAllPosts);
router.get("/likes/:id", protectedRoute, getLikedPost)
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/user/:username", protectedRoute, getUserPosts);
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, like_or_unlike_post);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);


export default router;