export interface AdminLoginInputDTO {
  email: string;
  password?: string;
}

export interface AdminLoginOutputDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordInputDTO {
  email: string;
}

export interface ResetPasswordInputDTO {
  email: string;
  otp: string;
  password?: string;
}

export interface ResendOtpInputDTO {
  email: string;
}

export interface ApproveMerchantInputDTO {
  id: string;
}

export interface ApproveMerchantOutputDTO {
  id: string;
  email: string;
  status: "approved";
}

export interface RejectMerchantInputDTO {
  id: string;
  reason: string;
}

export interface RejectMerchantOutputDTO {
  id: string;
  email: string;
  status: "rejected";
}

export interface BlockMerchantInputDTO {
  id: string;
}

export interface UnblockMerchantInputDTO {
  id: string;
}

export interface BlockUserInputDTO {
  id: string;
}

export interface UnblockUserInputDTO {
  id: string;
}
