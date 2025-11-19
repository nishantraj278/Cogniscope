"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      // Redirect to login
      router.push("/auth/login?registered=true");
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
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-5xl font-black mb-3">Create Account</h1>
          <p className="text-lg text-gray-600">
            Start your cognitive health journey today
          </p>
        </div>

        {/* Signup Form */}
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
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-lg font-medium focus:border-black focus:outline-none focus:ring-4 focus:ring-black/10 transition-all"
              />
            </div>

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
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-gray-700 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
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
              Create Account
            </Button>

            <div className="text-center pt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/auth/login"
                className="font-black text-black hover:text-red-600 transition-colors"
              >
                Sign In
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
