import { BlacklistedTokenModel } from "../database/models/blacklistedToken.model.ts";
import jwt from "jsonwebtoken";

export class TokenBlacklistService {
  /**
   * Add a token to the blacklist collection with automatic TTL expiry
   */
  async blacklistToken(token: string): Promise<void> {
    if (!token) return;

    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      
      // Calculate expiresAt. Fallback to 24 hours in the future if exp is missing.
      const expiresAt = decoded?.exp 
        ? new Date(decoded.exp * 1000) 
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Save to database, ignoring duplicate key errors (in case the token is already blacklisted)
      await BlacklistedTokenModel.updateOne(
        { token },
        { $setOnInsert: { token, expiresAt } },
        { upsert: true }
      );
    } catch (error) {
      // Safe catch so logout doesn't break due to token decoding issues
    }
  }

  /**
   * Check if a token exists in the blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;
    const exists = await BlacklistedTokenModel.findOne({ token }).lean();
    return !!exists;
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
