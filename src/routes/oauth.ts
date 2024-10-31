import express from "express";
import { Request, Response } from "oauth2-server";
import Models from "felixriddle.mongodb-models";

/**
 * Oauth routes
 */
export default function oauthRoutes(expressApp: any, models: Models) {
	const router = express.Router();

	router.get("/authorize", expressApp.oauth.authorize);
	router.post("/token", expressApp.oauth.token);
	router.get(
		"/authenticate",
		expressApp.oauth.authenticate
		// Not working for some reason
		// expressApp.oauth.test
	);

	// Function to generate the access token bases on the Oauth2Server request
	router.post("/token", (req, res, next) => {
		const requ = new Request(req);
		const resp = new Response(res);

		// Generate the token
		return expressApp.oauth
			.token(requ, resp)
			.then((token: any) => {
				return res.json(token);
			})
			.catch((err: any) => {
				return res.status(err.code || 500).json(err);
			});
	});

	// Middleware to intercept requests to secure and ensure they are authenticated
	router.use("/secure", (req, res, next) => {
		const requ = new Request(req);
		const resp = new Response(res);

		// Authenticate the request based on the token within the request
		return expressApp.oauth
			.authenticate(requ, resp)
			.then((token: any) => {
				return res.json(token);
			})
			.catch((err: any) => {
				return res.status(err.code || 500).json(err);
			});
	});

	// This can only be called by an authenticated request
	router.get("/secure", (req, res) => {
		return res.send({
			messages: [
				{
					message: "Authenticated secure endpoint",
					type: "success",
				},
			],
		});
	});

	return router;
}
