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
            <div style="background-color:#f6f8fb;padding:24px;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;width:100%;">
              <div style="width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);overflow:hidden;">
                <div style="padding:20px 24px;border-bottom:1px solid #f1f5f9;background:#0f172a;color:#ffffff;">
                  <div style="font-size:18px;font-weight:700;">MarshalLMS</div>
                </div>
                <div style="padding:32px 28px;">
                  <h1 style="margin:0 0 12px 0;font-size:24px;line-height:32px;color:#0f172a;font-weight:700;">Verify your email</h1>
                  <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:#475569;">Click the button below to securely sign in. This link will expire shortly for your security.</p>

                  <div style="text-align:center;margin:28px 0;">
                    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 16px rgba(37, 99, 235, 0.25);transition:all 0.2s ease;border:none;cursor:pointer;min-width:220px;text-align:center;">Verify Email</a>
                  </div>

                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
                    <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;font-weight:500;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break:break-all;font-size:13px;color:#0f172a;margin:0;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                      <a href="${url}" style="color:#2563eb;text-decoration:underline;">${url}</a>
                    </p>
                  </div>
                  <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div style="padding:14px 24px;border-top:1px solid #f1f5f9;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;">
                  ${new Date().getFullYear()} MarshalLMS
                </div>
              </div>
            </div>
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
                <div style="padding:32px 28px;">
                  <h1 style="margin:0 0 12px 0;font-size:24px;line-height:32px;color:#0f172a;font-weight:700;">Verify your email</h1>
                  <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:#475569;">Click the button below to securely sign in. This link will expire shortly for your security.</p>

                  <div style="text-align:center;margin:28px 0;">
                    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 4px 16px rgba(37, 99, 235, 0.25);transition:all 0.2s ease;border:none;cursor:pointer;min-width:220px;text-align:center;">Verify Email</a>
                  </div>

                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;">
                    <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;font-weight:500;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break:break-all;font-size:13px;color:#0f172a;margin:0;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
                      <a href="${url}" style="color:#2563eb;text-decoration:underline;">${url}</a>
                    </p>
                  </div>

                  <div style="border-top:1px solid #e2e8f0;margin:24px 0 16px 0"></div>
                  <p style="margin:0 0 12px 0;font-size:13px;color:#64748b;font-weight:500;">Or use this one-time code:</p>
                  <div style="display:inline-block;padding:12px 16px;background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);border:1px solid #cbd5e1;border-radius:10px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-weight:700;font-size:18px;letter-spacing:2px;color:#0f172a;box-shadow:0 2px 8px rgba(0,0,0,0.05);">${token}</div>

                  <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
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
