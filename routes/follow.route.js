import { Router } from "express";
import { toggleFollow, getFollowers, getFollowing } from "../controller/follow.controller.js";

const followRouter = Router();

followRouter.post("/:username/toggle", toggleFollow);
followRouter.get("/:username/followers", getFollowers);
followRouter.get("/:username/following", getFollowing);

export default followRouter;