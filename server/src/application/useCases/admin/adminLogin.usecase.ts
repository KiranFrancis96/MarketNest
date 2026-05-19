import type { IAdminRepository } from "@/domain/interface/admin.repository.ts";
import type { IAdminLoginUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { AdminLoginInputDTO, AdminLoginOutputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import {
  MSG_ADMIN_INVALID_CREDENTIALS,
  MSG_ADMIN_ACCESS_DENIED,
} from "./messages.constants.ts";

export class AdminLoginUseCase implements IAdminLoginUseCase {
  constructor(private _adminRepository: IAdminRepository) {}

  async execute({ email, password }: AdminLoginInputDTO): Promise<AdminLoginOutputDTO> {
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const admin = await this._adminRepository.findByEmail(email);

    if (!admin || !admin.password) {
      throw new ApiError(401, MSG_ADMIN_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(401, MSG_ADMIN_INVALID_CREDENTIALS);
    }

    if (!admin.isAdmin) {
      throw new ApiError(403, MSG_ADMIN_ACCESS_DENIED);
    }

    const payload = { id: admin.id, email: admin.email, isAdmin: true };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      accessToken,
      refreshToken,
    };
  }
}
