export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string | undefined;
  otpExpires?: Date | undefined;
  isBlocked: boolean;
}