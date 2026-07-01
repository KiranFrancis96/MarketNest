import { BlacklistedTokenModel } from "../database/models/blacklistedToken.model.ts";
import jwt from "jsonwebtoken";

export class TokenBlacklistService {
  async blacklistToken(token: string): Promise<void> {
    if (!token) return;

    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      
      const expiresAt = decoded?.exp 
        ? new Date(decoded.exp * 1000) 
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      await BlacklistedTokenModel.updateOne(
        { token },
        { $setOnInsert: { token, expiresAt } },
        { upsert: true }
      );
    } catch (error: unknown) {
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;
    const exists = await BlacklistedTokenModel.findOne({ token }).lean();
    return !!exists;
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
