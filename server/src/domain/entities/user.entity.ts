export interface UserPreferences {
  favoriteBrands?: string[];
  interestedCategories?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  offerSensitive?: boolean;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isVerified: boolean;
  otp?: string | undefined;
  otpExpiresAt?: Date | undefined;
  isBlocked: boolean;
  profilePic?: string;
  preferences?: UserPreferences;
  addresses?: Address[];
  walletBalance?: number;
}