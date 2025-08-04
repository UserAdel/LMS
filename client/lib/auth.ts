import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const { data, error } = await resend.emails.send({
          from: "MarshalLMS <onboarding@resend.dev>",
          to: [email],
          subject: "MarshalLMS - verify your email",
          html: `<p> your OTP is <strong>${otp}</strong></p>`,
        });
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: env.AUTH_GITHUB_SECRET as string,
    },
  },
});
