import type { ReviewerIdentity, UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      verifiedIdentity: ReviewerIdentity | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    verifiedIdentity?: ReviewerIdentity | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    verifiedIdentity?: ReviewerIdentity | null;
  }
}
