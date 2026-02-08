import { Request, Response } from "express";
import User from "../models/User.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const existedUser = await User.findOne({ email });
    if (existedUser)
      return res.status(400).json({ message: "Email đã được sử dụng!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Đăng ký thành công!", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }
    // 2. Kiểm tra mật khẩu (so sánh mật khẩu nhập vào với mật khẩu đã băm trong DB)
    // Lưu ý: Cần thêm kiểm tra user.password tồn tại vì interface IUser để optional
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }
    // 3. Tạo JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};
