import dotenv from "dotenv";

dotenv.config();

export const COOKIE_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: Number(process.env.ACCESS_TOKEN_MAX_AGE || 15 * 60 * 1000),
  REFRESH_TOKEN_MAX_AGE: Number(process.env.REFRESH_TOKEN_MAX_AGE || 7 * 24 * 60 * 60 * 1000),
};
