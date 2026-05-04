import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new UserRepository();

export const loginUser = async (email: string, password: string) => {
  const user = await repo.findByEmail(email);
  
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email address before logging in");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Please contact support.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload = { id: user._id, email: user.email };

  return {
    user: { id: user._id, email: user.email },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
