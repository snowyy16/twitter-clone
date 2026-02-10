import { upload } from "../services/upload.service";
import { createTweet, getTweet, toggleLike } from "../controllers/tweet.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", verifyToken, upload.single("image"), createTweet);
router.get("/", getTweet);
router.patch("/:id/like", verifyToken, toggleLike); // PATCH http://localhost:5000/api/tweets/<id>/like
export default router;
