import { AuthController } from "@/presentation/http/controllers/auth.controller.ts";
import * as useCases from "./useCases.ts";

export const authController = new AuthController(
  useCases.userRegisterUseCase,
  useCases.userVerifyOtpUseCase,
  useCases.userLoginUseCase,
  useCases.userForgotPasswordUseCase,
  useCases.userResetPasswordUseCase,
  useCases.userResendOtpUseCase,
  useCases.userLogoutUseCase,
  useCases.userRefreshTokenUseCase,
  useCases.getUserProfileUseCase,
  useCases.userGoogleAuthUseCase,
  useCases.addUserAddressUseCase,
  useCases.updateUserAddressUseCase,
  useCases.deleteUserAddressUseCase
);
