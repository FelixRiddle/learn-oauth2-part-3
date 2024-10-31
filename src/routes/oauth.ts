import express from "express";
import OAuth2Server, { Request, Response } from "oauth2-server";
import Models from "felixriddle.mongodb-models";

import OAuth2 from "@/OAuth2";

/**
 * Oauth routes
 */
export default function oauthRoutes(models: Models) {
	const router = express.Router();
	
	// Initialize the oauth server with a model representing the user principle
	// the model servers as the entity to query users from databases or LDAP or Active Directory
	const oauth2 = new OAuth2Server({
		model: new OAuth2(models),
		allowBearerTokensInQueryString: true,
	});
	
	// We need to create requests with 'new Request(req)', and use a middleware function to deal with these endpoints
	router.get("/authorize", oauth2.authorize);
	router.post("/token", oauth2.token);
	router.get(
		"/authenticate",
		oauth2.authenticate,
		// Not working for some reason
		// expressApp.oauth.test
	);

	// // Function to generate the access token bases on the Oauth2Server request
	// router.post("/token", (req, res, next) => {
	// 	const requ = new Request(req);
	// 	const resp = new Response(res);

	// 	// Generate the token
	// 	return expressApp.oauth
	// 		.token(requ, resp)
	// 		.then((token: any) => {
	// 			return res.json(token);
	// 		})
	// 		.catch((err: any) => {
	// 			return res.status(err.code || 500).json(err);
	// 		});
	// });

	// // Middleware to intercept requests to secure and ensure they are authenticated
	// router.use("/secure", (req, res, next) => {
	// 	const requ = new Request(req);
	// 	const resp = new Response(res);

	// 	// Authenticate the request based on the token within the request
	// 	return expressApp.oauth
	// 		.authenticate(requ, resp)
	// 		.then((token: any) => {
	// 			return res.json(token);
	// 		})
	// 		.catch((err: any) => {
	// 			return res.status(err.code || 500).json(err);
	// 		});
	// });

	// // This can only be called by an authenticated request
	// router.get("/secure", (req, res) => {
	// 	return res.send({
	// 		messages: [
	// 			{
	// 				message: "Authenticated secure endpoint",
	// 				type: "success",
	// 			},
	// 		],
	// 	});
	// });

	return router;
}
