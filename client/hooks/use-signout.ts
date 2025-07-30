"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignout() {
  const router = useRouter();

  const handleSignOut = async function singOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("Logged out successfully");
        },
        onError: () => {
          toast.error("Failed to log out");
        },
      },
    });
  };
  return handleSignOut;
}
