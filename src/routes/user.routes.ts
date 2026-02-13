import {
  getNotifications,
  toggleFollow,
  updateProfile,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { getProfile } from "../controllers/user.controller";
import { upload } from "../services/upload.service";

const router = Router();
router.patch("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.get("/notifications", verifyToken, getNotifications);
router.post("/follow", verifyToken, toggleFollow);
router.get("/:username", getProfile);

export default router;
