import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";
import { parseUserAgent } from "@/lib/device";
import {
  createUserSession,
  isSessionRevoked,
  touchUserSession,
} from "@/lib/sessions";
import crypto from "crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  providers: [
    Credentials({
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const ip = getClientIp(req);
        const { allowed } = await rateLimit(`login:${ip}`, 10, 900);
        if (!allowed) {
          throw new Error("Too many login attempts. Try again later.");
        }

        const { identifier, method, password } = parsed.data;
        const user =
          method === "phone"
            ? await db.user.findUnique({ where: { phone: identifier } })
            : await db.user.findUnique({ where: { email: identifier } });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const ua = req.headers?.get?.("user-agent") ?? null;
        const { deviceName, deviceType } = parseUserAgent(ua);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: false,
          shopSlug: null,
          planName: "free",
          _deviceName: deviceName,
          _deviceType: deviceType,
          _ip: ip ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.shopSlug = user.shopSlug;
        token.planName = user.planName ?? "free";

        token.sessionId = crypto.randomUUID();
        createUserSession({
          userId: user.id as string,
          sessionId: token.sessionId as string,
          deviceName: (user as { _deviceName?: string })._deviceName ?? null,
          deviceType: (user as { _deviceType?: string })._deviceType ?? null,
          ip: (user as { _ip?: string })._ip ?? null,
        }).catch(() => {});
      }

      if (token.sessionId) {
        if (await isSessionRevoked(token.sessionId as string)) return null;
        touchUserSession(token.sessionId as string).catch(() => {});
      }

      if (trigger === "update") {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (fresh) {
          token.role = fresh.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.isVerified = token.isVerified as boolean;
      session.user.shopSlug = token.shopSlug as string | null;
      session.user.planName = token.planName as string;
      session.user.sessionId = token.sessionId as string | undefined;
      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role: string;
    isVerified: boolean;
    shopSlug: string | null;
    planName?: string;
    _deviceName?: string;
    _deviceType?: string;
    _ip?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isVerified: boolean;
      shopSlug: string | null;
      planName: string;
      sessionId?: string;
    };
  }
}
