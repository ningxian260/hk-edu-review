import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const providers: Provider[] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (isDatabaseConfigured && process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDatabaseConfigured ? PrismaAdapter(prisma) : undefined,
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "local-development-secret-change-before-production" : undefined),
  session: { strategy: isDatabaseConfigured ? "database" : "jwt" },
  trustHost: true,
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub ?? "";
        session.user.role = user?.role ?? "USER";
        session.user.verifiedIdentity = user?.verifiedIdentity ?? null;
      }

      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "USER";
        token.verifiedIdentity = user.verifiedIdentity ?? null;
      }

      return token;
    },
  },
});
