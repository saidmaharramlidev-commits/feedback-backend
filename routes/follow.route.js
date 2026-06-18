import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { getFollowers, getFollowing, removeFollower, toggleFollow } from "../controller/follow.controller.js";

const followRouter = Router();

followRouter.post("/:username/toggle", requireAuth(), toggleFollow);
followRouter.delete("/:username/remove-follower", requireAuth(), removeFollower);
followRouter.get("/:username/followers", getFollowers);
followRouter.get("/:username/following", getFollowing);

export default followRouter;