import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_INVALID_CREDENTIALS,
  MSG_USER_NOT_VERIFIED,
  MSG_USER_BLOCKED,
} from "./messages.constants.ts";

const repo = new UserRepository();

export const loginUser = async (email: string, password: string) => {
  const user = await repo.findByEmail(email);

  if (!user) {
    throw new ApiError(401, MSG_USER_INVALID_CREDENTIALS);
  }

  if (!user.isVerified) {
    throw new ApiError(403, MSG_USER_NOT_VERIFIED);
  }

  if (user.isBlocked) {
    throw new ApiError(403, MSG_USER_BLOCKED);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, MSG_USER_INVALID_CREDENTIALS);
  }

  const payload = { id: user._id, email: user.email };

  return {
    user: { id: user._id, email: user.email },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
