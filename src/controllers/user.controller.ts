import { Response } from "express";
import Follow from "../models/Follow.schema";
import User from "../models/User.schema";
import Tweet from "../models/Tweet.schema";
import { error } from "node:console";
import Notification from "../models/Notification.schema";

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

export const getProfile = async (req: any, res: Response) => {
  try {
    const { username } = req.params;
    // 1. Lấy thông tin User (không lấy password)
    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    // 2. Đếm số người đang theo dõi và người được theo dõi
    const followingCount = await Follow.countDocuments({
      follower_id: user._id,
    });
    const followersCount = await Follow.countDocuments({
      following_id: user._id,
    });
    // 3. Lấy danh sách Tweet của người này
    const tweet = await Tweet.find({ user_id: user._id }).sort({
      created_at: -1,
    });
    return res.status(200).json({
      user,
      stats: { followingCount, followersCount, tweetsCount: tweet.length },
      tweet,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin cá nhân", error });
  }
};
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;
    // Lấy URL ảnh từ S3 nếu người dùng có upload file mới
    const avatarUrl = (req.file as any)?.location;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (avatarUrl) updateData.avatar = avatarUrl;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    ).select("-password");
    if (!updateUser)
      return res
        .status(404)
        .json({ message: "Lỗi không tìm thấy người dùng", error });
    return res
      .status(200)
      .json({ message: "Cập nhật thành công", user: updateUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin", error });
  }
};
export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware verifyToken

    const notifications = await Notification.find({
      recipient_id: userId,
    })
      .populate("sender_id", "username avatar") // Lấy thông tin người tương tác
      .populate("tweet_id", "content") // Lấy nội dung tweet liên quan
      .sort({ createdAt: -1 }); // Thông báo mới nhất lên đầu

    return res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông báo", error });
  }
};

export const searchUsers = async (req: any, res: Response) => {
  try {
    const query = req.query.q as string;
    const users = await User.find({
      username: { $regex: query, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
    })
      .select("username avatar")
      .limit(10);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi tìm kiếm người dùng", error });
  }
};
