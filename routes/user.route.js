import { requireAuth } from "@clerk/express";
import express from "express";
import { getFollowers, getFollowing, removeFollower, toggleFollow } from "../controller/follow.controller.js";
import { blockUser, getMe, getUserByUsername, reportUser, searchUsers, syncUser, updateUser } from "../controller/user.controller.js";


const userRouter = express.Router();

userRouter.get("/me", requireAuth(), getMe);
userRouter.patch("/me", requireAuth(), updateUser);
userRouter.post("/sync", syncUser);
userRouter.get("/search", requireAuth(), searchUsers);
userRouter.get("/:username", getUserByUsername);
userRouter.post("/:username/block", requireAuth(), blockUser);
userRouter.post("/:username/report", requireAuth(), reportUser);


userRouter.post("/:username/toggle", requireAuth(), toggleFollow);
userRouter.delete("/:username/remove-follower", requireAuth(), removeFollower);
userRouter.get("/:username/followers", getFollowers);
userRouter.get("/:username/following", getFollowing);

export default userRouter;