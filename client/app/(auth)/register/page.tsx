import { auth } from "@/lib/auth";
import { LoginForm } from "./_component/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function loginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/");
  }
  return <LoginForm />;
}
