import { Response } from "express";
import Tweet from "../models/Tweet.schema";

export const createTweet = async (req: any, res: Response) => {
  try {
    const { content, image, video } = req.body;

    const imageUrl = (req.file as any)?.location || "";

    const newTweet = new Tweet({
      user_id: req.user.userId,
      content,
      image: imageUrl,
      video,
    });
    await newTweet.save();
    res.status(201).json({ message: "Đăng bài thành công!", tweet: newTweet });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi đăng bài", error });
  }
};

export const getTweet = async (req: any, res: Response) => {
  try {
    const tweets = await Tweet.find()
      .populate("user_id", "username avatar")
      .sort({ created_at: -1 });
    return res.status(200).json(tweets);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài đăng", error });
  }
};
export const toggleLike = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // id cua tweet
    const userId = req.user.userId;
    const tweet = await Tweet.findById(id);
    if (!tweet)
      return res.status(404).json({ message: "Không tìm thất tweet" });
    const isLiked = tweet.likes.includes(userId);

    if (isLiked) {
      tweet.likes = tweet.likes.filter((id) => id.toString() !== userId);
    } else {
      tweet.likes.push(userId as any);
    }
    await tweet.save();
    return res.status(200).json({
      message: isLiked ? "Đã bỏ thích" : "Đã thích bài viết",
      likesCount: tweet.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};
