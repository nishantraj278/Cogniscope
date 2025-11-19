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
    <nav
      className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm w-full"
      style={{ paddingLeft: "15rem" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 w-full">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                  <span className="text-white text-lg font-bold relative z-10">
                    C
                  </span>
                  <span className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </div>
                <span className="absolute -inset-1 bg-red-600 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></span>
              </div>

              {/* Logo Text */}
              <span className="text-xl font-bold text-black group-hover:text-gray-800 transition-colors duration-300">
                OGNISCOPE
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {session && (
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link
                href="/dashboard"
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive("/dashboard")
                    ? "text-white bg-black shadow-md"
                    : "text-gray-700 hover:text-black hover:bg-gray-100"
                }`}
              >
                {isActive("/dashboard") && (
                  <span className="absolute inset-0 bg-red-600 opacity-20 rounded-lg"></span>
                )}
                <span className="relative z-10">Dashboard</span>
              </Link>
              <Link
                href="/reports"
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive("/reports")
                    ? "text-white bg-black shadow-md"
                    : "text-gray-700 hover:text-black hover:bg-gray-100"
                }`}
              >
                {isActive("/reports") && (
                  <span className="absolute inset-0 bg-red-600 opacity-20 rounded-lg"></span>
                )}
                <span className="relative z-10">Reports</span>
              </Link>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-4 shrink-0">
            {session ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
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
                  <Button variant="danger" size="sm">
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
