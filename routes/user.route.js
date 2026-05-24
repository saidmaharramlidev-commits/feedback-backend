import express from "express";
import { getUserByUsername, getMe, updateUser } from "../controller/user.controller.js";
import { requireAuth } from "@clerk/express";

const userRouter = express.Router();

// protected routes
userRouter.get("/me", requireAuth(), getMe);
userRouter.patch("/me", requireAuth(), updateUser);

// public profile
userRouter.get("/:username", getUserByUsername);



export default userRouter;