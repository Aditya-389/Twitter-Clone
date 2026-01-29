import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import { getUserProfile, follow_unfollow_user, getSuggestedUsers, updateProfile } from "../controllers/user_controller.js";


const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, follow_unfollow_user);
router.post("/update", protectedRoute, updateProfile);

export default router;