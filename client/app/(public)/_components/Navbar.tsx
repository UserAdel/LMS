"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/Logo.png";
import { ThemeToggle } from "@/components/themeToggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./UserDropdown";

const navigationItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link className="flex items-center space-x-2 mr-4" href="/">
          <Image src={logo} alt="logo" className="size-9" />
          <span className="hidden md:flex font-bold">MashalLMS</span>
        </Link>
        {/* Desktop Navigation */}
        <nav className="flex justify-between items-center flex-1">
          <div className="flex items-center space-x-2 ">
            {navigationItems.map((item) => {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex justify-center items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            {isPending ? null : session ? (
              <UserDropdown
                email={session.user.email}
                image={
                  session.user.image ||
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
                name={
                  session?.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split("@")[0]
                }
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link className={buttonVariants()} href="/">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
