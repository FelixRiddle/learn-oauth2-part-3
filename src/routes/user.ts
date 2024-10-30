import express, { Request, Response } from "express";
import Models from "felixriddle.mongodb-models";

/**
 * User routes
 */
export default function userRoutes(models: Models) {
	const router = express.Router();

	router.get("/", (async (req: Request, res: Response) => {
		try {
			// Get user id
			const userId = (req as any).session.userId;
			if (!userId) {
				return res.status(401).send({
					messages: [
						{
							error: true,
							message: "Unauthorized",
						},
					],
				});
			}

			// Fetch user
			const { User } = models;
			const user = await User.findById(userId).lean();

			return res.send({
				user,
			});
		} catch (err) {
			console.error(err);
			return res.status(500).send({
				messages: [
					{
						error: true,
						message: "Internal error",
					},
				],
			});
		}
	}) as any);

	return router;
}
