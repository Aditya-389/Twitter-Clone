import express from "express"
import { protectedRoute } from "../middleware/protectRoute.js";
import { getNotification, deleteNotification, deleteOneNotification } from "../controllers/notification_controller.js"
 
const router = express.Router();

router.get("/", protectedRoute, getNotification);
router.delete("/", protectedRoute, deleteNotification);
router.delete("/:id", protectedRoute, deleteOneNotification);

export default router;


