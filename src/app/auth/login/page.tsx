"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-6">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-5xl font-black mb-3">Welcome Back</h1>
          <p className="text-lg text-gray-600">
            Sign in to continue your cognitive journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl p-10 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border-2 border-red-600 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-red-600 font-bold">{error}</span>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-lg font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-lg font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/10 transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-full text-lg"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center pt-4">
              <span className="text-gray-600">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/signup"
                className="font-black text-black hover:text-red-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
