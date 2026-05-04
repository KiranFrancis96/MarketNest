export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  isBlocked: boolean;
}