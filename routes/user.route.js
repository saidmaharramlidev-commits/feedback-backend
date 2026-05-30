import express from "express";
import { getUserByUsername, getMe, updateUser } from "../controller/user.controller.js";
import { requireAuth } from "@clerk/express";
import { searchUsers } from "../controller/user.controller.js";
import { syncUser } from "../controller/user.controller.js";

const userRouter = express.Router();

// protected routes
userRouter.get("/me", requireAuth(), getMe);
userRouter.patch("/me", requireAuth(), updateUser);
userRouter.post("/sync", syncUser);



userRouter.get("/search", searchUsers);

// public profile
userRouter.get("/:username", getUserByUsername);



export default userRouter;