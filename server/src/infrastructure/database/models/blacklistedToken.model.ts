import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: {
    type: Date,
    required: true,
    index: {
      expires: 0
    }
  }
});

export const BlacklistedTokenModel = mongoose.model(
  "BlacklistedToken",
  blacklistedTokenSchema,
  "blacklisted_tokens"
);
