import { ApiError } from "./apiError.ts";

export interface GooglePayload {
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GooglePayload> {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      throw new ApiError(401, "Invalid Google ID token");
    }
    const data = (await response.json()) as Record<string, unknown>;
    if (!data.email) {
      throw new ApiError(401, "Google ID token does not contain email");
    }
    return data as unknown as GooglePayload;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to verify Google token";
    throw new ApiError(401, message);
  }
}
