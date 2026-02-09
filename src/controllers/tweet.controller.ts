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
