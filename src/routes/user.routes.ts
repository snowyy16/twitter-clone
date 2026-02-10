import { toggleFollow } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();
router.post("/follow", verifyToken, toggleFollow);
export default router;
