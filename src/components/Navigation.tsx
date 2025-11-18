"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/Button";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              COGNISCOPE
            </Link>

            {session && (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-black hover:text-red-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/reports"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/reports")
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-black hover:text-red-600"
                  }`}
                >
                  Reports
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm font-medium hidden sm:block">
                  {session.user?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
