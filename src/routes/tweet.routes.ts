import { upload } from "../services/upload.service";
import {
  createTweet,
  getCommentByTweet,
  getTweet,
  toggleLike,
} from "../controllers/tweet.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { addComment } from "../controllers/tweet.controller";
const router = Router();

router.post("/", verifyToken, upload.single("image"), createTweet);
router.get("/", verifyToken, getTweet);
router.patch("/:id/like", verifyToken, toggleLike); // PATCH http://localhost:5000/api/tweets/<id>/like
router.post("/comment", verifyToken, addComment);
router.get("/:id/comments", getCommentByTweet); // GET http://localhost:5000/api/tweets/<id>/comments
export default router;
