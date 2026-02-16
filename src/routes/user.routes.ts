import {
  getNotifications,
  markNotificationsAsRead,
  searchUsers,
  toggleFollow,
  updateProfile,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { getProfile } from "../controllers/user.controller";
import { upload } from "../services/upload.service";

const router = Router();
// 1. Các route tĩnh/cụ thể đưa lên đầu
router.patch("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.get("/notifications", verifyToken, getNotifications);
router.patch("/notifications/read", verifyToken, markNotificationsAsRead);
router.get("/search", searchUsers);

// 2. Các route có tham số động đưa xuống cuối
router.get("/followers/:username", verifyToken, getFollowers);
router.get("/following/:username", verifyToken, getFollowing);
router.get("/suggested", verifyToken, getSuggestedUsers);
router.get("/:username", verifyToken, getProfile);
export default router;
