import { Router } from "express";
import { handleClerkWebhook } from "../controller/webhook.controller.js";
import express from "express";

const webhookRouter = Router();

// raw body needed for svix signature verification
webhookRouter.post(
    "/clerk",
    express.raw({ type: "application/json" }),
    handleClerkWebhook
);

export default webhookRouter;