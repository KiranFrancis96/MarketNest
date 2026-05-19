import { verifyRefreshToken, generateAccessToken } from "@/infrastructure/services/jwt.service.ts";
import type { IUserRefreshTokenUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";

export class UserRefreshTokenUseCase implements IUserRefreshTokenUseCase {
  execute(token: string): string {
    const decoded: any = verifyRefreshToken(token);
    return generateAccessToken({ id: decoded.id, email: decoded.email });
  }
}