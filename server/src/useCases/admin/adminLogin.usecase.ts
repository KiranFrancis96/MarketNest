import { AdminRepository } from "@/infrastructure/repositories/admin.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";

const repo = new AdminRepository();

export const adminLogin = async (email: string, password: string) => {
  const admin = await repo.findByEmail(email);

  if (!admin || !admin.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!admin.isAdmin) {
    throw new ApiError(403, "Access denied. Not an admin.");
  }

  const payload = { id: admin.id, email: admin.email, isAdmin: true };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isAdmin: admin.isAdmin,
    },
  };
};
