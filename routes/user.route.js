import express from "express";
import { getUserByUsername, getMe, updateUser, blockUser, reportUser } from "../controller/user.controller.js";
import { requireAuth } from "@clerk/express";
import { searchUsers } from "../controller/user.controller.js";
import { syncUser } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.get("/me", requireAuth(), getMe);
userRouter.patch("/me", requireAuth(), updateUser);
userRouter.post("/sync", syncUser);
userRouter.get("/search", requireAuth(), searchUsers);
userRouter.get("/:username", getUserByUsername);
userRouter.post("/:username/block", requireAuth(), blockUser);
userRouter.post("/:username/report", requireAuth(), reportUser);

export default userRouter;