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
import Link from "next/link";
import Image from "next/image";
import googleIcon from "../../../../public/googleIcon.svg";

export function LoginForm() {
  const router = useRouter();
  const [githubPending, startGitubTransition] = useTransition();
  const [emailPending, startEmailtranstion] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  async function signInWithGoogle() {
    startGoogleTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
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
      await authClient.signIn.email({
        email: email, // required
        password: password,
        // callbackURL: "http://localhost:3000/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("signed in successfully");
            router.push(`/`);
          },
          onError: () => {
            toast.error("Invalid Credentials");
          },
        },
      });
    });
  }

  // function signInWithEmail() {
  //   startEmailtranstion(async () => {
  //     const { data, error } = await authClient.emailOtp.sendVerificationOtp({
  //       email: email, // required
  //       type: "sign-in",
  //       fetchOptions: {
  //         onSuccess: () => {
  //           toast.success("Email Sent");
  //           router.push(`/verify-request?email=${email}&password=${password}`);
  //         },
  //         onError: () => {
  //           toast.error("error Sending Email");
  //         },
  //       },
  //     });
  //   });
  // }

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

        <Button
          onClick={signInWithGoogle}
          className="w-full"
          variant="outline"
          disabled={googlePending}
        >
          {googlePending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <>
              <Image src={googleIcon} alt="googleIcon" className="size-4" />
              Sign in with Google
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
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="****************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <span>Login</span>
              </>
            )}
          </Button>
          <div className="flex text-center justify-center items-center ">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </p>
            <Link
              className="hover:text-primary hover:underline cursor-pointer ml-1"
              href="/register"
            >
              Register
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
