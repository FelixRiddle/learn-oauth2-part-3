import express from "express";
import Models from "felixriddle.mongodb-models";
import oauthRoutes from "./oauth";
import userRoutes from "./user";
import authRouter from "./auth";

/**
 * Main router
 */
export default function mainRouter(models: Models) {
	const router = express.Router();
    
    // Add your routes here
	router.use("/auth", authRouter(models));
	router.use("/oauth", oauthRoutes(models));
	router.use("/user", userRoutes(models));
    
    return router;
}
