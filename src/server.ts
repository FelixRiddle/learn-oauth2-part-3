import express from "express";
import Models from "felixriddle.mongodb-models";
import bodyParser from "body-parser";
import OAuth2Server from "oauth2-server";

import oauthRoutes from "@/routes/oauth";
import userRoutes from "@/routes/user";
import OAuth2 from "@/OAuth2";

/**
 * Run express server
 */
export default function runExpressServer(models: Models, port: number) {
	const app = express();
	
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	
	// Initialize the oauth server with a model representing the user principle
	// the model servers as the entity to query users from databases or LDAP or Active Directory
	app.oauth = new OAuth2Server({
		model: new OAuth2(models),
		allowBearerTokensInQueryString: true,
	});
	
	app.use("/oauth", oauthRoutes(app, models));
	app.use("/user", userRoutes(models));
	
	app.listen(port, () => {
		// Tabnine autogenerated
		console.log(`Server running on port ${port}`);
		
        console.log("Press Ctrl+C to stop the server");
        process.on("SIGINT", () => {
            console.log("Server stopped");
            process.exit(0);
        });
        process.on("SIGTERM", () => {
            console.log("Server stopped");
            process.exit(0);
        });
        process.on("SIGUSR2", () => {
            console.log("Server stopped");
            process.exit(0);
        });
        process.on("uncaughtException", (err) => {
            console.error("Uncaught exception", err);
            process.exit(1);
        });
	});
}
