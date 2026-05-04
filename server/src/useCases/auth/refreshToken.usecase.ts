import { verifyRefreshToken, generateAccessToken } from "@/infrastructure/services/jwt.service.ts";

export const refreshTokenUseCase = (token: string) => {
  const decoded: any = verifyRefreshToken(token);
  return generateAccessToken({ id: decoded.id, email: decoded.email });
};