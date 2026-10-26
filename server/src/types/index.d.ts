import { Role } from "@prisma/client";

export interface AuthUser {
  id_user: number;
  username: string;
  nama: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
