import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Truy cập bị từ chối" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Token không hợp lệ" });
  }
};
