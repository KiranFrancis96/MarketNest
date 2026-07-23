import type { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  id?: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      merchant?: AuthPayload;
      admin?: AuthPayload;
    }
  }
}
