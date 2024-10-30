import "express-session";
import { Models } from "felixriddle.ts-app-models";

import { User } from "./types/User";
import { StatusMessage } from "types/StatusMessage";

declare module "express-session" {
	interface Session {
		// Authenticated OAuth2 client
		oauth2Credentials?: {
			clientId: string;
			scopes: string[];
		};
		// Authenticated user
		userId?: number;
		// User preferred language
		language?: string;
	}
}

declare global {
	namespace Express {
		interface Request {
			user?: User;
			messages: Array<StatusMessage>;
			models: Models;
			isAuthenticated: () => boolean;
			debugMode: boolean;
			auth: {
				userId: number,
				sessionType: string;
			}
		}
	}
}
