import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi hệ thống nội bộ";

  // Xử lý lỗi ID không hợp lệ của MongoDB (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Dữ liệu không hợp lệ: Giá trị '${err.value}' không đúng định dạng ID.`;
  }

  // Xử lý lỗi trùng lặp dữ liệu (ví dụ: trùng Email/Username)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Dữ liệu này đã tồn tại trong hệ thống.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    // Chỉ hiển thị stack trace chi tiết khi đang ở môi trường phát triển (development)
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
