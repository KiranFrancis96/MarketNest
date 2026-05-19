import type {
  AdminLoginInputDTO,
  AdminLoginOutputDTO,
  ForgotPasswordInputDTO,
  ResetPasswordInputDTO,
  ResendOtpInputDTO,
  ApproveMerchantInputDTO,
  ApproveMerchantOutputDTO,
  RejectMerchantInputDTO,
  RejectMerchantOutputDTO,
  BlockMerchantInputDTO,
  UnblockMerchantInputDTO,
  BlockUserInputDTO,
  UnblockUserInputDTO,
} from "@/application/dtos/admin/AdminDtos.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import type { User } from "@/domain/entities/user.entity.ts";

export interface IAdminLoginUseCase {
  execute(input: AdminLoginInputDTO): Promise<AdminLoginOutputDTO>;
}

export interface IApproveMerchantUseCase {
  execute(input: ApproveMerchantInputDTO): Promise<ApproveMerchantOutputDTO>;
}

export interface IBlockMerchantUseCase {
  execute(input: BlockMerchantInputDTO): Promise<void>;
}

export interface IBlockUserUseCase {
  execute(input: BlockUserInputDTO): Promise<void>;
}

export interface IForgotPasswordUseCase {
  execute(input: ForgotPasswordInputDTO): Promise<void>;
}

export interface IGetMerchantsUseCase {
  execute(): Promise<Merchant[]>;
}

export interface IGetPendingMerchantsUseCase {
  execute(): Promise<Merchant[]>;
}

export interface IGetUsersUseCase {
  execute(): Promise<User[]>;
}

export interface IRejectMerchantUseCase {
  execute(input: RejectMerchantInputDTO): Promise<RejectMerchantOutputDTO>;
}

export interface IResendAdminOtpUseCase {
  execute(input: ResendOtpInputDTO): Promise<void>;
}

export interface IResetPasswordUseCase {
  execute(input: ResetPasswordInputDTO): Promise<void>;
}

export interface IUnblockMerchantUseCase {
  execute(input: UnblockMerchantInputDTO): Promise<void>;
}

export interface IUnblockUserUseCase {
  execute(input: UnblockUserInputDTO): Promise<void>;
}
