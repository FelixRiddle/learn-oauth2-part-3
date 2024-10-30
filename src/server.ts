import express from "express";
import Models from "felixriddle.mongodb-models";
import oauthRoutes from "@/routes/oauth";
import userRoutes from "@/routes/user";

/**
 * Run express server
 */
export default function runExpressServer(models: Models, port: number) {
	const app = express();
	
	app.use("/oauth", oauthRoutes(models));
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
