import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUserGoogleAuthUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserLoginOutputDTO } from "@/application/dtos/user/UserDtos.ts";
import { verifyGoogleToken } from "@/utils/google.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import bcrypt from "bcrypt";

export class UserGoogleAuthUseCase implements IUserGoogleAuthUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(credential: string): Promise<UserLoginOutputDTO> {
    const payload = await verifyGoogleToken(credential);
    const email = payload.email;

    let user = await this._userRepository.findByEmail(email);

    if (!user) {
      const firstName = payload.given_name || payload.name || "Google";
      const lastName = payload.family_name || "User";
      // Generate a random secure password for database constraints
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString();
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await this._userRepository.create({
        firstName,
        lastName,
        email,
        password: hashed,
        isVerified: true,
        isBlocked: false,
      }) as any;

      if (!user) {
        throw new ApiError(500, "Failed to create user account");
      }
    } else {
      if (user.isBlocked) {
        throw new ApiError(403, "User account is blocked. Please contact support.");
      }

      if (!user.isVerified) {
        await this._userRepository.update({ isVerified: true }, email);
        user.isVerified = true;
      }
    }

    const tokenPayload = { id: user._id, email: user.email };

    return {
      user,
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }
}
