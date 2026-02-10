import { Response } from "express";
import Follow from "../models/Follow.schema";

export const toggleFollow = async (req: any, res: Response) => {
  try {
    const { followingId } = req.body;
    const followerId = req.user.userId;

    if (followerId === followingId) {
      return res
        .status(400)
        .json({ message: "Bạn không thể tự theo dõi chính mình" });
    }
    const existingFollow = await Follow.findOne({
      follower_id: followerId,
      following_id: followingId,
    });
    if (existingFollow) {
      await Follow.deleteOne({ _id: existingFollow._id });
      return res.status(200).json({ message: "Đã bỏ theo dõi" });
    }

    const newFollow = new Follow({
      follower_id: followerId,
      following_id: followingId,
    });
    await newFollow.save();
    res.status(200).json({ message: "Đã theo dõi thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};
