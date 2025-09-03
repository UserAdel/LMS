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
import { GithubIcon, Loader, Send, User2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import getAllUsers from "../action";
import Image from "next/image";
import googleIcon from "../../../../public/googleIcon.svg";

export function LoginForm() {
  const router = useRouter();
  const [githubPending, startGitubTransition] = useTransition();
  const [emailPending, startEmailtranstion] = useTransition();
  const [googlePending, startGoogleTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  async function signInWithEmail() {
    const users = await getAllUsers();
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      toast.error("User Already Exists. Please Login");
      return;
    }
    //add validation for email and password
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    //email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return;
    }
    //password regex
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter and one number"
      );
      return;
    }
    if (email && password) {
      //confirm password
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    startEmailtranstion(async () => {
      await authClient.signUp.email({
        email: email, // required
        name: "user",
        password: password,
        callbackURL: "https://lms-azure-tau.vercel.app/login",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email Sent");
            router.push("/magicLink");
          },
          onError: () => {
            toast.error("error Sending Email");
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
        <CardTitle className="text-xl ">Welcome To MarshalLMS</CardTitle>
        <CardDescription>Register with GitHub or Email Account</CardDescription>
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
            Or Register with
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
            <Label htmlFor="password"> Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="****************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={emailPending}
            />
            <Label htmlFor="password"> Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              placeholder="****************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div className="flex text-center justify-center items-center ">
            <p className="text-muted-foreground">Already Have an Account? </p>
            <Link
              className="hover:text-primary hover:underline cursor-pointer ml-1"
              href="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
