"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function VerifyRequestRoute() {
  return (
    <Suspense>
      <VerifyRequest />
    </Suspense>
  );
}
function VerifyRequest() {
  const [otp, setOtp] = useState("");
  const [emailPending, StartTranstion] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") as string;
  const password = params.get("password") as string;
  const router = useRouter();
  const isOtpComplete = otp.length === 6;

  const handleVerify = () => {
    // Basic validation
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    StartTranstion(async () => {
      try {
        await authClient.emailOtp.verifyEmail({
          email: email,
          otp: otp,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Account created successfully!");
              router.push("/");
            },
            onError: (error: any) => {
              console.error("Account creation error:", error);
              toast.error(error.error?.message || "Failed to create account. Please try again.");
            },
          },
        });
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Failed to create account. Please try again.");
      }
    });
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          we have snet a vervifation email code to your email address. Please
          open the email and past the code below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
            className="gap-2 "
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit sent to your email
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={emailPending || !isOtpComplete}
        >
          {emailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            "Verify Account"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
