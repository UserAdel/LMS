"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GithubIcon, Loader, Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [githubPending, startGitubTransition] = useTransition();
  const [emailPending, startEmailtranstion] = useTransition();
  const [email, setEmail] = useState("");

  async function signInWithGithub() {
    startGitubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in successfully");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      });
    });
  }

  function signInWithEmail() {
    startEmailtranstion(async () => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: email, // required
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email Sent");
            router.push(`/verify-request?email=${email}`);
          },
          onError: () => {
            toast.error("error Sending Email");
          },
        },
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl ">Welcome back!</CardTitle>
        <CardDescription>login in with GitHub or Email Account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          onClick={signInWithGithub}
          className="w-full"
          variant="outline"
          disabled={githubPending}
        >
          {githubPending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <>
              <GithubIcon className="size-4" />
              Sign in with GitHub
            </>
          )}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:item-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={emailPending}
            />
          </div>
          <Button onClick={signInWithEmail} disabled={emailPending}>
            {emailPending ? (
              <>
                <Loader className="size-4 animate-spin" />
                <span> loading</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
