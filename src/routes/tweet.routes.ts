import { createTweet, getTweet } from "../controllers/tweet.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", verifyToken, createTweet);
router.get("/", getTweet);
export default router;
