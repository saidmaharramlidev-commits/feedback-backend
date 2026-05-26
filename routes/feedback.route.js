import { Router } from "express";
import { getMyFeedbacks, sendFeedback, deleteFeedback, getLikedFeedbacks } from "../controller/feedback.controller.js";
import { requireAuth } from "@clerk/express";
import { toggleLikeFeedback } from "../controller/feedback.controller.js";

const feedbackRouter = Router();


feedbackRouter.get("/me", requireAuth(), getMyFeedbacks);
feedbackRouter.get("/liked", requireAuth(), getLikedFeedbacks);
feedbackRouter.post("/:username", sendFeedback);

feedbackRouter.delete("/:id", requireAuth(), deleteFeedback);
feedbackRouter.patch("/:id/like", toggleLikeFeedback)









export default feedbackRouter;