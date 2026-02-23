import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const validateMessage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    receiverId: Joi.string().required().length(24).messages({
      "string.length": "ID người nhận không hợp lệ",
      "any.required": "Thiếu ID người nhận",
    }),
    content: Joi.string().required().min(1).max(500).messages({
      "string.empty": "Nội dung tin nhắn không được để trống",
      "string.max": "Tin nhắn không được quá 500 ký tự",
    }),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
