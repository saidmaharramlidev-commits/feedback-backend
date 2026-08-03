import { Router } from "express";
import { getMyFeedbacks, sendFeedback, deleteFeedback, getLikedFeedbacks, reportFeedback } from "../controller/feedback.controller.js";
import { requireAuth } from "@clerk/express";
import { toggleLikeFeedback } from "../controller/feedback.controller.js";
import { getDailyCount } from "../controller/feedback.controller.js";

const feedbackRouter = Router();


feedbackRouter.get("/me", requireAuth(), getMyFeedbacks);
feedbackRouter.get("/liked", requireAuth(), getLikedFeedbacks);
feedbackRouter.get("/daily-count", requireAuth(), getDailyCount);
feedbackRouter.post("/:username", sendFeedback);


feedbackRouter.delete("/:id", requireAuth(), deleteFeedback);
feedbackRouter.patch("/:id/like", requireAuth(), toggleLikeFeedback)
feedbackRouter.post("/:id/report", requireAuth(), reportFeedback);









export default feedbackRouter;