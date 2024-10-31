/**
 * Get jwt token
 */
export function jwtToken() {
	const secret = process.env.JWT_TOKEN || process.env.SECRET_TOKEN;

	if (!secret) {
		throw new Error(
			"Missing JWT_TOKEN or SECRET_TOKEN environment variable."
		);
	}

	return secret;
}
