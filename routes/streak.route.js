import { Router } from "express";
import { getStreak } from "../controller/streak.controller.js";

const streakRouter = Router();

// public — anyone can see anyone's streak by clerkId
streakRouter.get("/:clerkId", getStreak);

export default streakRouter;