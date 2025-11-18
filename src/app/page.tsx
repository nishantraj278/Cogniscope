"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session } = useSession();

  // Floating bubble animation variants
  const bubbleVariants = {
    animate: (custom: number) => ({
      y: [0, -30, 0],
      x: [0, custom * 10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 4 + custom,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  // Pre-calculated bubble positions for consistency
  const bubbles = [
    { size: 120, left: 10, top: 15, color: "#FF0000" },
    { size: 80, left: 85, top: 25, color: "#000000" },
    { size: 150, left: 45, top: 5, color: "#E5E7EB" },
    { size: 100, left: 25, top: 60, color: "#FF0000" },
    { size: 90, left: 70, top: 70, color: "#E5E7EB" },
    { size: 110, left: 50, top: 85, color: "#000000" },
    { size: 75, left: 15, top: 40, color: "#E5E7EB" },
    { size: 95, left: 90, top: 55, color: "#FF0000" },
    { size: 130, left: 35, top: 30, color: "#000000" },
    { size: 85, left: 60, top: 50, color: "#E5E7EB" },
    { size: 105, left: 80, top: 10, color: "#FF0000" },
    { size: 115, left: 20, top: 80, color: "#000000" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={bubbleVariants}
            animate="animate"
            className="absolute rounded-full border-2"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              borderColor: bubble.color,
              opacity: 0.1,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo Bubble */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-white text-4xl font-bold">C</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 w-24 h-24 mx-auto bg-red-600 rounded-full opacity-20 blur-xl"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold mb-6 tracking-tight bg-linear-to-r from-black via-gray-800 to-red-600 bg-clip-text text-transparent"
            >
              COGNISCOPE
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 mb-10"
            >
              <p className="text-2xl md:text-3xl font-semibold text-gray-800">
                AI-Powered Cognitive Assessment
              </p>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Early detection and prevention of cognitive decline through
                advanced AI analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {session ? (
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 text-lg font-semibold bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl shadow-2xl hover:shadow-red-600/50 transition-all duration-300 min-w-[250px] border-2 border-red-600 hover:border-red-500"
                  >
                    Dashboard →
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      variant="primary"
                      className="shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all min-w-[200px]"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="shadow-md hover:shadow-xl transform hover:scale-105 transition-all min-w-[200px]"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Large Decorative Bubbles */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-64 h-64 bg-linear-to-br from-red-100 to-transparent rounded-full opacity-30 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-linear-to-br from-gray-200 to-transparent rounded-full opacity-20 blur-3xl"
        />
      </section>

      {/* Spacer */}
      <div className="h-32" />

      {/* Features Section */}
      <section className="py-20 relative w-full flex justify-center bg-white">
        <div className="w-full max-w-7xl px-8 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-black to-gray-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to understand your cognitive health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gray-300 to-transparent -translate-y-1/2" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 hover:border-black relative overflow-hidden group">
                {/* Bubble Number */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative inline-block mb-8"
                >
                  <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg relative z-10">
                    1
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-red-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Create Account
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Sign up in seconds and access your personalized cognitive
                  assessment dashboard with AI-powered insights.
                </p>

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-gray-200 rounded-full opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 hover:border-red-600 relative overflow-hidden group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative inline-block mb-8"
                >
                  <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg relative z-10">
                    2
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-black rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Take AI Test
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Complete a scientifically-validated cognitive assessment
                  generated by advanced AI technology.
                </p>

                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-red-200 rounded-full opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 hover:border-black relative overflow-hidden group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative inline-block mb-8"
                >
                  <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg relative z-10">
                    3
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-red-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Get Report
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Receive detailed insights, risk assessment, and personalized
                  recommendations for your brain health.
                </p>

                <div className="absolute top-4 right-4 w-16 h-16 border-2 border-gray-200 rounded-full opacity-50" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32 bg-white" />

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden w-full flex justify-center">
        {/* Floating Decoration */}
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-red-200 rounded-full opacity-20" />
        <div className="absolute bottom-20 right-20 w-60 h-60 border-2 border-gray-300 rounded-full opacity-20" />

        <div className="w-full max-w-7xl px-8 sm:px-12 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Why CogniScope?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets healthcare expertise
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {[
              {
                title: "🤖 AI-Powered Analysis",
                description:
                  "Advanced AI evaluates your cognitive performance with medical-grade accuracy and precision.",
                color: "red",
              },
              {
                title: "🎯 Early Detection",
                description:
                  "Identify potential cognitive decline indicators before clinical symptoms appear.",
                color: "black",
              },
              {
                title: "📊 Personalized Reports",
                description:
                  "Get tailored recommendations and preventive strategies based on your unique results.",
                color: "red",
              },
              {
                title: "📈 Track Progress",
                description:
                  "Monitor your cognitive health journey over time with comprehensive reporting.",
                color: "black",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-white rounded-3xl p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border-2 border-gray-100 relative overflow-hidden group"
                >
                  {/* Background Bubble */}
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 ${
                      benefit.color === "red" ? "bg-red-600" : "bg-black"
                    } rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-2xl`}
                  />

                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg md:text-xl">
                    {benefit.description}
                  </p>

                  {/* Corner Accent */}
                  <div
                    className={`absolute bottom-4 right-4 w-12 h-12 border-2 ${
                      benefit.color === "red"
                        ? "border-red-200"
                        : "border-gray-200"
                    } rounded-full opacity-30`}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32 bg-gray-50" />

      {/* CTA Section */}
      <section className="py-20 bg-black text-white relative overflow-hidden w-full flex justify-center">
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-10 left-10 w-64 h-64 bg-red-600 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-5xl px-8 sm:px-12 lg:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              viewport={{ once: true }}
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 mx-auto bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white text-3xl">🧠</span>
              </div>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Take Control of Your
              <br />
              Cognitive Health
            </h2>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Start your assessment today and gain valuable insights into your
              brain health with AI-powered analysis.
            </p>
            {!session && (
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="danger"
                  className="shadow-2xl hover:shadow-red-600/50 transform hover:scale-105 transition-all"
                >
                  Start Free Assessment →
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
