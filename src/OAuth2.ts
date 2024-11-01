import Models from "felixriddle.mongodb-models";
import { AuthorizationCode, Client, Falsey, Token, User } from "oauth2-server";
import { v4 as uuidv4 } from "uuid";

/**
 * OAuth2
 *
 * Has to follow this specification:
 * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#verifyscope-accesstoken-scope-callback
 */
export default class OAuth2 {
	OAuthClients;
	OAuthAuthorizationCodes;
	OAuthAccessTokens;
	OAuthRefreshTokens;

	/**
	 * Constructor
	 */
	constructor(models: Models) {
		this.OAuthClients = models.OAuthClients;
		this.OAuthAuthorizationCodes = models.OAuthAuthorizationCodes;
		this.OAuthAccessTokens = models.OAuthAccessTokens;
		this.OAuthRefreshTokens = models.OAuthRefreshTokens;
	}

	/**
	 * Get client
	 */
	async getClient(
		clientId: string,
		clientSecret?: string
	): Promise<Client | Falsey> {
		const client = await this.OAuthClients.findOne({
			clientId,
			...(clientSecret && { clientSecret }),
		}).lean();

		if (!client) {
			return false; // Return false instead of null
		}

		if (!client.callbackUrl) {
			return false;
		}

		return {
			id: client.clientId!,
			grants: client.grants,
			redirectUris: [client.callbackUrl],
		};
	}

	/**
	 * Save authorization code
	 */
	async saveAuthorizationCode(
		code: Pick<
			AuthorizationCode,
			"authorizationCode" | "expiresAt" | "redirectUri" | "scope"
		>,
		client: Client,
		user: User
	): Promise<AuthorizationCode> {
		const authorizationCode = {
			authorizationCode: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			client: { id: client.id, grants: client.grants },
			user: { id: user.id },
		};

		await this.OAuthAuthorizationCodes.create({
			_id: uuidv4(),
			...authorizationCode,
		});

		return authorizationCode;
	}

	/**
	 * Get authorization code
	 */
	async getAuthorizationCode(
		authorizationCode: string
	): Promise<AuthorizationCode | Falsey> {
		const code: any = await this.OAuthAuthorizationCodes.findOne({
			authorizationCode,
		}).lean();
		if (!code) {
			throw new Error("Authorization code not found");
		}

		return {
			authorizationCode: code.authorizationCode,
			expiresAt: code.expiresAt,
			redirectUri: code.redirectUri,
			scope: code.scope,
			client: {
				id: code.clientId,
				grants: "authorization_code",
			},
			user: {
				id: code.userId,
			},
		};
	}

	/**
	 * Revoke authorization code
	 */
	async revokeAuthorizationCode({ code }: any) {
		const res = await this.OAuthAuthorizationCodes.deleteOne({
			authorizationCode: code,
		});
		return res.deletedCount === 1;
	}

	/**
	 * Revoke a refresh token
	 */
	async revokeRefreshToken({ refreshToken }: any) {
		const res = await this.OAuthRefreshTokens.deleteOne({
			refreshToken,
		});
		return res.deletedCount === 1;
	}

	/**
	 * Save token
	 */
	async saveToken(
		token: any,
		client: Client,
		user: User
	): Promise<Token | Falsey> {
		// Create access token
		await this.OAuthAccessTokens.create({
			accessToken: token.accessToken,
			accessTokenExpiresAt: token.accessTokenExpiresAt,
			scope: token.scope,
			_id: uuidv4(),
			clientId: client.id,
			userId: user.id,
		});

		// If refresh token exists create it too
		if (token.refreshToken) {
			await this.OAuthRefreshTokens.create({
				refreshToken: token.refreshToken,
				refreshTokenExpiresAt: token.refreshTokenExpiresAt,
				scope: token.scope,
				_id: uuidv4(),
				clientId: client.id,
				userId: user.id,
			});
		}

		return {
			accessToken: token.accessToken,
			accessTokenExpiresAt: token.accessTokenExpiresAt,
			refreshToken: token.refreshToken,
			refreshTokenExpiresAt: token.refreshTokenExpiresAt,
			scope: token.scope,
			client: {
				id: client.id,
				grants: client.grants,
			},
			user: {
				id: user.id,
			},
		};
	}

	/**
	 * Get access token
	 */
	async getAccessToken(accessToken: string): Promise<Token | Falsey> {
		console.log(`Get access token: ${accessToken}`);
		const token = await this.OAuthAccessTokens.findOne({ accessToken });

		if (!token) {
			return false; // Return false instead of null or undefined
		}

		return {
			accessToken: token.accessToken!,
			accessTokenExpiresAt: token.accessTokenExpiresAt!,
			scope: token.scope!,
			client: {
				id: token.clientId!,
				grants: [],
			},
			user: {
				id: token.userId!,
			},
		};
	}

	/**
	 * Get refresh token
	 */
	async getRefreshToken(refreshToken: string) {
		const token: any = await this.OAuthRefreshTokens.findOne({
			refreshToken,
		}).lean();
		if (!token) {
			throw new Error("Refresh token not found");
		}

		return {
			refreshToken: token.refreshToken,
			// refreshTokenExpiresAt: token.refreshTokenExpiresAt, // never expires
			scope: token.scope,
			client: {
				id: token.clientId,
			},
			user: {
				id: token.userId,
			},
		};
	}

	/**
	 * Verify scope
	 */
	async verifyScope(token: any, scope: string) {
		if (!token.scope) {
			return false;
		}

		const requestedScopes = scope.split(":");
		const authorizedScopes = token.scope.split(":");

		return requestedScopes.every((s) => authorizedScopes.indexOf(s) >= 0);
	}

	/**
	 * Create a new client
	 */
	async createClient(clientData: any) {
		// Validate client data
		const newClient = await this.OAuthClients.create(clientData);
		return newClient;
	}

	/**
	 * Update client
	 */
	async updateClient(clientId: string, clientData: any) {
		// Validate client ID and data
		const updatedClient = await this.OAuthClients.findOneAndUpdate(
			{ clientId },
			clientData,
			{ new: true }
		);
		return updatedClient;
	}

	/**
	 * Delete client
	 */
	async deleteClient(clientId: string) {
		const deletedCount = await this.OAuthClients.deleteOne({ clientId });
		return deletedCount.deletedCount === 1;
	}

	/**
	 * Revoke access token
	 */
	async revokeAccessToken({ accessToken }: any) {
		const res = await this.OAuthAccessTokens.deleteOne({ accessToken });
		return res.deletedCount === 1;
	}

	/**
	 * Validate client redirect URI
	 */
	async validateClientRedirectUri(
		clientId: string,
		redirectUri: string
	): Promise<boolean> {
		const client = await this.getClient(clientId);

		// Check if client exists
		if (!client || !client.redirectUris) {
			return false;
		}

		// Check if redirect URI is valid
		return client.redirectUris.includes(redirectUri);
	}
}
