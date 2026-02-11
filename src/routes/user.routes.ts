import { toggleFollow } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { getProfile } from "../controllers/user.controller";

const router = Router();
router.post("/follow", verifyToken, toggleFollow);
router.get("/:username", getProfile);
export default router;
