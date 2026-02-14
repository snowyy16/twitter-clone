import { Response } from "express";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Tweet from "../models/Tweet.schema";
import Follow from "../models/Follow.schema";
import Comment from "../models/Comment.schema";
import Notification from "../models/Notification.schema";
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
    // 1. Tìm danh sách những người mà người dùng đang theo dõi
    const userId = req.user.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const following = await Follow.find({ follower_id: userId }).select(
      "following_id",
    );
    const followingIds = following.map((f) => f.following_id);

    // 2. Thêm ID của chính người dùng vào danh sách để thấy bài viết của mình
    followingIds.push(userId);
    // 3. Lọc Tweet: user_id phải nằm trong danh sách followingIds
    const tweets = await Tweet.find({
      user_id: { $in: followingIds },
    })
      .populate("user_id", "username avatar")
      .sort({ created_at: -1 })
      .skip(skip) // Bỏ qua các bài viết của trang trước
      .limit(limit); // Giới hạn số lượng bài viết lấy ra
    const totalTweets = await Tweet.countDocuments({
      user_id: { $in: followingIds },
    });
    return res.status(200).json({
      tweets,
      currentPage: page,
      totalPages: Math.ceil(totalTweets / limit),
      totalTweets,
    });
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
    const isLiked = tweet.likes.some((likeId) => likeId.toString() === userId);

    if (isLiked) {
      tweet.likes = tweet.likes.filter((id) => id.toString() !== userId);
    } else {
      tweet.likes.push(userId as any);
    }
    await tweet.save();
    if (!isLiked) {
      const newNotification = new Notification({
        recipient_id: tweet.user_id,
        sender_id: userId,
        type: "like",
        tweet_id: tweet._id,
      });
      await newNotification.save();
    }
    return res.status(200).json({
      message: isLiked ? "Đã bỏ thích" : "Đã thích bài viết",
      likesCount: tweet.likes.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};
export const addComment = async (req: any, res: Response) => {
  try {
    const { tweetId, content } = req.body;
    const newComment = new Comment({
      tweet_id: tweetId,
      user_id: req.user.userId,
      content,
    });
    await newComment.save();
    return res
      .status(201)
      .json({ message: "Bình luận thành công", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi bình luận", error });
  }
};
export const getCommentByTweet = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ tweet_id: id })
      .populate("user_id", "username avatar")
      .sort({ createdAt: -1 });
    return res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bình luận", error });
  }
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
export const deleteTweet = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const tweet = await Tweet.findById(id);
    if (!tweet)
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    // Kiểm tra quyền sở hữu
    if (tweet.user_id.toString() !== userId)
      return res
        .status(403)
        .json({ message: " Bạn không có quyền xóa bài này" });
    if (tweet.image) {
      const key = tweet.image.split("/").pop();
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `tweets/${key}`,
        }),
      );
    }
    await Tweet.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa bài đăng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài đăng", error });
  }
};
export const searchTweets = async (req: any, res: Response) => {
  try {
    const query = req.query.q as string;
    const tweets = await Tweet.find({
      username: { $regex: query, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
    })
      .populate("user_id", "username avatar")
      .limit(10);
    return res.status(200).json(tweets);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi tìm kiếm bài đăng", error });
  }
};
