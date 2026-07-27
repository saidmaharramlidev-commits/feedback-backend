import { Router } from "express";
import { sendReply, getMyReplies, deleteReply } from "../controller/reply.controller.js";
import { requireAuth } from "@clerk/express";

const replyRouter = Router();

replyRouter.post("/:feedbackId/reply", requireAuth(), sendReply);
replyRouter.get("/inbox", requireAuth(), getMyReplies);
replyRouter.delete("/:replyId", requireAuth(), deleteReply);

export default replyRouter;