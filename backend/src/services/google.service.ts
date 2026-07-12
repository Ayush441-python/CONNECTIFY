import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

const client = new OAuth2Client(config.googleClientId);

export async function verifyGoogleIdToken(idToken: string): Promise<TokenPayload & { googleId: string; email: string }> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.googleClientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw ApiError.unauthorized('Invalid Google ID token payload');
    }

    return {
      ...payload,
      googleId: payload.sub,
      email: payload.email,
    } as TokenPayload & { googleId: string; email: string };
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired Google ID token');
  }
}
