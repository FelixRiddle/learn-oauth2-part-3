import express, { NextFunction, Request, Response } from "express";
import Models from "felixriddle.mongodb-models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { jwtToken } from "@/config/env";

/**
 * Auth routes
 */
export default function authRouter(models: Models) {
	const router = express.Router();

	const { User } = models;

	/**
	 * Register route
	 */
	router.post(
		"/register",
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const { name, username, email, password } = req.body;

				// Validation
				if (!name || !username || !email || !password) {
					return res.status(400).json({
						messages: [
							{
								message: "All fields are required",
								type: "error",
							},
						],
					});
				}

				if (typeof password !== "string" || password.length < 8) {
					return res.status(400).json({
						message: [
							{
								message:
									"Password must be at least 8 characters long",
								type: "error",
							},
						],
					});
				}

				// Hash password
				const hashedPassword = await bcrypt.hash(password, 10);

				// Create new user
				const user = await User.create({
					username,
					email,
					password: hashedPassword,
					name,
				});

				// Generate JWT token
				const token = jwt.sign({ userId: user._id }, jwtToken(), {
					expiresIn: "1h",
				});

				// Set cookie with JWT token
				res.cookie("token", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					maxAge: 60 * 60 * 1000, // 1 hour
				});

				return res.status(201).json({
					user,
					messages: [
						{
							message: "User registered successfully",
							type: "success",
						},
					],
				});
			} catch (error) {
				console.error(error);
				return res.send({
					messages: [
						{
							message: "Error 500: Internal error",
							type: "error",
						},
					],
				});
			}
		}
	);

	/**
	 * Login route
	 */
	router.post(
		"/login",
		async (req: Request, res: Response, next: NextFunction) => {
			try {
				const { email, password } = req.body;

				// Find user by email
				const user = await User.findOne({ email });

				if (!user) {
					return res
						.status(401)
						.json({ message: "Invalid credentials" });
				}

				// Compare passwords
				const isValidPassword = await bcrypt.compare(
					password,
					user.password
				);

				if (!isValidPassword) {
					return res
						.status(401)
						.json({ message: "Invalid credentials" });
				}

				// Generate JWT token
				const token = jwt.sign({ userId: user._id }, jwtToken(), {
					expiresIn: "1h",
				});

				// Set cookie with JWT token
				res.cookie("token", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					maxAge: 60 * 60 * 1000, // 1 hour
				});

				return res.json({ message: "Logged in successfully" });
			} catch (error) {
				console.error(error);
				return res.send({
					messages: [
						{
							message: "Error 500: Internal error",
							type: "error",
						},
					],
				});
			}
		}
	);

	return router;
}
