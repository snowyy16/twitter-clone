import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
dotenv.config();
// Khởi tạo S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
// Cấu hình Multer S3
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    // acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.filename });
    },
    key: (req, file, cb) => {
      cb(null, `tweets/${Date.now()}_${file.originalname}`);
    },
  }),
});
