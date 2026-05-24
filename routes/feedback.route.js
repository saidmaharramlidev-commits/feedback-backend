import { Router } from "express";
import { getMyFeedbacks, sendFeedback, deleteFeedback } from "../controller/feedback.controller.js";
import { requireAuth } from "@clerk/express";

const feedbackRouter = Router();


feedbackRouter.get("/me", requireAuth(), getMyFeedbacks);
feedbackRouter.post("/:username", sendFeedback);
feedbackRouter.delete("/:id", requireAuth(), deleteFeedback);








export default feedbackRouter;