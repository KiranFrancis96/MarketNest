export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  password?: string;
  otp?: string;
  otpExpires?: Date;
}
