import { validationRegister } from "../middlewares/validation.middleware";
import { register, login } from "../controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/register", validationRegister, register);
router.post("/login", login);
export default router;
