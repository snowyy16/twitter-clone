import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./configs/db";

import authRoutes from "./routes/auth.routes";

dotenv.config();

connectDB();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev")); //Log các request ra terminal để dễ debug
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
