// import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import nodemailer from "nodemailer";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Create transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: env.GOOGLE_EMAIL_USERSNAME, // your gmail
            pass: env.GOOGLE_EMAIL_PASSWORD, // app password from google
          },
        });

        // Send email
        const info = await transporter.sendMail({
          from: '"MarshalLMS" <youraccount@gmail.com>',
          to: email,
          subject: "MarshalLMS - verify your email",
          html: `<p>Your OTP is <strong>${otp}</strong></p>`,
        });

        console.log("Message sent: %s", info.messageId);
      },
    }),
    admin(),
  ],
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: env.AUTH_GITHUB_SECRET as string,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
