import express from "express";
import OAuth2Server, {
	AccessDeniedError,
	Request,
	Response,
} from "oauth2-server";
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

	router.get(
		"/authenticate",
		async (req, res) => {
			const request = new Request(req);
			const response = new Response(res);
			return oauth2
				.authenticate(request, response)
				.then((token) => {
					// The request was successfully authenticated.
					return res.send({
						token,
					});
				})
				.catch((err) => {
					console.error(err);
					// The request failed authentication.
					return res.status(err.code || 500).send({
						messages: [
							{
								message: "Error: " + err.message,
								type: "error",
							},
						],
					});
				});
		}
		// Not working for some reason
		// expressApp.oauth.test
	);

	// We need to create requests with 'new Request(req)', and use a middleware function to deal with these endpoints
	router.get("/authorize", async (req, res) => {
		const request = new Request(req);
		const response = new Response(res);
		return await oauth2
			.authorize(request, response)
			.then((token) => {
				// The resource owner granted the access request.
				return res.send({
					token,
				});
			})
			.catch((err) => {
				console.error(err);
				if (err instanceof AccessDeniedError) {
					// The resource owner denied the access request.
					return res.status(err.code || 500).send({
						messages: [
							{
								message: "Access Denied",
								type: "error",
							},
						],
					});
				} else {
					// Access was not granted due to some other error condition.
					return res.status(err.code || 500).send({
						messages: [
							{
								message: "Error: " + err.message,
								type: "error",
							},
						],
					});
				}
			});
	});

	router.post("/token", async (req, res) => {
		const request = new Request(req);
		const response = new Response(res);
		return await oauth2
			.token(request, response)
			.then((token) => {
				// The resource owner granted the access request.
				return res.json({
					token,
				});
			})
			.catch((err) => {
				console.error(err);
				// The request was invalid or not authorized.
				return res.status(err.code || 500).send({
					messages: [
						{
							message: "Error: " + err.message,
							type: "error",
						},
					],
				});
			});
	});
	
	return router;
}
