import { Response } from "express";
import Follow from "../models/Follow.schema";
import User from "../models/User.schema";
import Tweet from "../models/Tweet.schema";
import Notification from "../models/Notification.schema";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { error } from "node:console";

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
    const currentUserId = req.user?.userId;

    // 1. Lấy thông tin User
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    })
      .select("-password")
      .lean();

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    // 2. Thực hiện các truy vấn song song để tối ưu
    const [followingCount, followersCount, userTweets] = await Promise.all([
      Follow.countDocuments({ follower_id: user._id }),
      Follow.countDocuments({ following_id: user._id }),
      Tweet.find({ user_id: user._id }).sort({ created_at: -1 }).lean(),
    ]);

    // 3. Kiểm tra trạng thái follow
    const isFollowing = await Follow.exists({
      follower_id: currentUserId,
      following_id: user._id,
    });

    return res.status(200).json({
      user: { ...user, isFollowing: !!isFollowing },
      stats: {
        followingCount,
        followersCount,
        tweetsCount: userTweets.length,
      },
      tweets: userTweets,
    });
  } catch (error) {
    console.error("Lỗi Profile:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin cá nhân", error });
  }
};
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;
    // Lấy URL ảnh từ S3 nếu người dùng có upload file mới
    const avatarUrl = (req.file as any)?.location;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Lỗi không tìm thấy người dùng" });

    const updateData: any = {};
    if (username) updateData.username = username;
    if (avatarUrl) {
      if (user.avatar && user.avatar.includes("amazonaws.com")) {
        try {
          const oldKey = user.avatar.split("/").pop(); // Lấy tên file
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `tweets/${oldKey}`, // Đảm bảo đúng folder trên S3
            }),
          );
        } catch (s3Error) {
          console.error("Lỗi xóa ảnh cũ trên S3:", s3Error);
        }
      }
    }

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
export const markNotificationsAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId; // Lấy từ Token

    await Notification.updateMany(
      { recipient_id: userId, is_read: false },
      { $set: { is_read: true } },
    );

    return res
      .status(200)
      .json({ message: "Đã đánh dấu tất cả thông báo là đã đọc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo", error });
  }
};
// Lấy danh sách những người đang theo dõi user này (Followers)
export const getFollowers = async (req: any, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const followers = await Follow.find({ following_id: user._id })
      .populate("follower_id", "username avatar") // Lấy info người đi follow
      .select("follower_id");

    return res.status(200).json(followers.map((f) => f.follower_id));
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách followers", error });
  }
};

// Lấy danh sách những người mà user này đang theo dõi (Following)
export const getFollowing = async (req: any, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const following = await Follow.find({ follower_id: user._id })
      .populate("following_id", "username avatar") // Lấy info người được follow
      .select("following_id");

    return res.status(200).json(following.map((f) => f.following_id));
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách following", error });
  }
};
export const getSuggestedUsers = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    // 1. Lấy danh sách ID những người bạn ĐÃ follow
    const following = await Follow.find({ follower_id: userId }).select(
      "following_id",
    );
    const followingIds = following.map((f) => f.following_id);
    followingIds.push(userId);
    // 2. Tìm người dùng mới không nằm trong danh sách trên
    const suggestUser = await User.find({
      _id:{$nin: followingIds}
    }).select("username avatar").limit(5).lean()
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy gợi ý người dùng", error });
  }
};
