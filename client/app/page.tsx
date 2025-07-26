"use client";
import { ThemeToggle } from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function singOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("Logged out successfully");
        },
      },
    });
  }

  return (
    <div className="p-24">
      <h1 className="text-3xl font-bold underline text-red-500 ">Home Page</h1>
      <ThemeToggle />
      {session?.user ? (
        <div>
          <p>Hello {session.user.name}</p>
          <Button onClick={singOut}>Logout</Button>
        </div>
      ) : (
        <Button>Login</Button>
      )}
    </div>
  );
}
