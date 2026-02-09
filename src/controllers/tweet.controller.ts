import { Response } from "express";
import Tweet from "../models/Tweet.schema";

export const createTweet = async (req: any, res: Response) => {
  try {
    const { content, image, video } = req.body;

    const newTweet = new Tweet({
      user_id: req.user.userId,
      content,
      image,
      video,
    });
    await newTweet.save();
    res.status(201).json({ message: "Đăng bài thành công!", tweet: newTweet });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi đăng bài", error });
  }
};
