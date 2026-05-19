import type {
  MerchantRegisterInputDTO,
  MerchantVerifyOtpInputDTO,
  MerchantVerifyOtpOutputDTO,
  MerchantLoginInputDTO,
  MerchantLoginOutputDTO,
  MerchantForgotPasswordInputDTO,
  MerchantResetPasswordInputDTO,
  MerchantResendOtpInputDTO,
  MerchantReapplyInputDTO,
} from "@/application/dtos/merchant/MerchantDtos.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";

export interface IMerchantRegisterUseCase {
  execute(input: MerchantRegisterInputDTO): Promise<void>;
}

export interface IMerchantVerifyOtpUseCase {
  execute(input: MerchantVerifyOtpInputDTO): Promise<MerchantVerifyOtpOutputDTO>;
}

export interface IMerchantLoginUseCase {
  execute(input: MerchantLoginInputDTO): Promise<MerchantLoginOutputDTO>;
}

export interface IMerchantForgotPasswordUseCase {
  execute(input: MerchantForgotPasswordInputDTO): Promise<void>;
}

export interface IMerchantResetPasswordUseCase {
  execute(input: MerchantResetPasswordInputDTO): Promise<void>;
}

export interface IMerchantResendOtpUseCase {
  execute(input: MerchantResendOtpInputDTO): Promise<void>;
}

export interface IMerchantReapplyUseCase {
  execute(id: string, input: MerchantReapplyInputDTO): Promise<Merchant>;
}

export interface IGetMerchantProfileUseCase {
  execute(id: string): Promise<Partial<Merchant>>;
}

export interface IMerchantLogoutUseCase {
  execute(): Promise<boolean>;
}

export interface IMerchantGoogleAuthUseCase {
  execute(credential: string): Promise<MerchantLoginOutputDTO & { isProfileComplete: boolean }>;
}

export interface ICompleteMerchantProfileUseCase {
  execute(id: string, input: any): Promise<Merchant>;
}
