// import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP, magicLink } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import nodemailer from "nodemailer";

// Create a reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GOOGLE_EMAIL_USERSNAME,
    pass: env.GOOGLE_EMAIL_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    minPasswordLength: 6,
    maxPasswordLength: 100,
  },
  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: env.GOOGLE_EMAIL_USERSNAME, // your gmail
            pass: env.GOOGLE_EMAIL_PASSWORD, // app password from google
          },
        });

        const info = await transporter.sendMail({
          from: '"MarshalLMS" <youraccount@gmail.com>', // Replace with your email
          to: user.email,
          subject: "Verify your email - MarshalLMS",
          html: `
            <h1>Email Verification</h1>
            <p>Click the link below to verify your email:</p>
            <a href="${url}">${url}</a>
          `,
        });
        console.log("Verification email sent:", info.messageId);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
  },
  plugins: [
    magicLink({
      async sendMagicLink({ email, token, url }) {
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
          html: `<p>Your OTP is <strong>${url}</strong></p>`,
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
