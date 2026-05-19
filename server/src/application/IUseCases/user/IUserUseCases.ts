import type {
  UserRegisterInputDTO,
  UserVerifyOtpInputDTO,
  UserVerifyOtpOutputDTO,
  UserLoginInputDTO,
  UserLoginOutputDTO,
  UserForgotPasswordInputDTO,
  UserResetPasswordInputDTO,
  UserResendOtpInputDTO,
} from "@/application/dtos/user/UserDtos.ts";
import type { User } from "@/domain/entities/user.entity.ts";

export interface IUserRegisterUseCase {
  execute(input: UserRegisterInputDTO): Promise<void>;
}

export interface IUserVerifyOtpUseCase {
  execute(input: UserVerifyOtpInputDTO): Promise<UserVerifyOtpOutputDTO>;
}

export interface IUserLoginUseCase {
  execute(input: UserLoginInputDTO): Promise<UserLoginOutputDTO>;
}

export interface IUserForgotPasswordUseCase {
  execute(input: UserForgotPasswordInputDTO): Promise<void>;
}

export interface IUserResetPasswordUseCase {
  execute(input: UserResetPasswordInputDTO): Promise<void>;
}

export interface IUserResendOtpUseCase {
  execute(input: UserResendOtpInputDTO): Promise<void>;
}

export interface IUserLogoutUseCase {
  execute(): Promise<boolean>;
}

export interface IUserRefreshTokenUseCase {
  execute(token: string): string;
}

export interface IGetUserProfileUseCase {
  execute(id: string): Promise<User>;
}
