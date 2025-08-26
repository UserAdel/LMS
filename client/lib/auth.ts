// import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { magicLink } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import nodemailer from "nodemailer";

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
            <a href="${url}">Click here to verify</a>
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
            user: env.GOOGLE_EMAIL_USERSNAME,
            pass: env.GOOGLE_EMAIL_PASSWORD,
          },
        });

        // Send email
        const info = await transporter.sendMail({
          from: '"MarshalLMS" <youraccount@gmail.com>',
          to: email,
          subject: "MarshalLMS - verify your email",
          html: `
            <div style="background-color:#f6f8fb;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);overflow:hidden;">
                <div style="padding:20px 24px;border-bottom:1px solid #f1f5f9;background:#0f172a;color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;">MarshalLMS</div>
                </div>
                <div style="padding:28px 24px;">
                  <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#0f172a;">Verify your email</h1>
                  <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#334155;">Click the button below to securely sign in. This link will expire shortly for your security.</p>

                  <div style="text-align:center;margin:20px 0;">
                    <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px;">Verify Email</a>
                  </div>

                  <p style="margin:16px 0 8px 0;font-size:12px;color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="word-break:break-all;font-size:12px;color:#0f172a;margin:0 0 16px 0;">
                    <a href="${url}" style="color:#2563eb;text-decoration:underline;">${url}</a>
                  </p>

                  <div style="border-top:1px solid #e5e7eb;margin:20px 0 12px 0"></div>
                  <p style="margin:0 0 6px 0;font-size:12px;color:#64748b;">Or use this one-time code:</p>
                  <div style="display:inline-block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-weight:700;font-size:16px;letter-spacing:1px;color:#0f172a;">${token}</div>

                  <p style="margin:20px 0 0 0;font-size:12px;color:#64748b;">If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div style="padding:14px 24px;border-top:1px solid #f1f5f9;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;">
                  ${new Date().getFullYear()} MarshalLMS
                </div>
              </div>
            </div>
          `,
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
