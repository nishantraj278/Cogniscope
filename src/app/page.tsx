"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Zap,
  BarChart3,
  Target,
  LineChart,
  Clock,
  Lock,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

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

  const bubbles = [
    { size: 120, left: 10, top: 15 },
    { size: 80, left: 85, top: 25 },
    { size: 150, left: 45, top: 5 },
    { size: 100, left: 25, top: 60 },
    { size: 90, left: 70, top: 70 },
    { size: 110, left: 50, top: 85 },
    { size: 75, left: 15, top: 40 },
    { size: 95, left: 90, top: 55 },
    { size: 130, left: 35, top: 30 },
    { size: 85, left: 60, top: 50 },
    { size: 105, left: 80, top: 10 },
    { size: 115, left: 20, top: 80 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={bubbleVariants}
            animate="animate"
            className="absolute rounded-full"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              background:
                i % 3 === 0
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08), transparent)"
                  : i % 3 === 1
                    ? "linear-gradient(135deg, rgba(6, 182, 212, 0.08), transparent)"
                    : "linear-gradient(135deg, rgba(99, 102, 241, 0.06), transparent)",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/30 to-indigo-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 rotate-3">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-500 rounded-2xl opacity-20 blur-xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700">
                <Sparkles className="w-4 h-4" />
                AI-Powered Cognitive Assessment
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                COGNISCOPE
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 mb-10"
            >
              <p className="text-xl md:text-2xl font-medium text-slate-700">
                Early Detection & Prevention of Cognitive Decline
              </p>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Advanced AI analysis for comprehensive cognitive health
                insights. Take control of your brain health today.
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 min-w-[250px] flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      variant="primary"
                      className="shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 min-w-[200px]"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="min-w-[200px]"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Instant Results</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative w-full flex justify-center">
        <div className="w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600 tracking-wide">
                Simple Process
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 text-balance">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Three simple steps to understand your cognitive health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-200 via-cyan-300 to-emerald-200" />

            {[
              {
                step: 1,
                title: "Create Account",
                description:
                  "Sign up in seconds and access your personalized cognitive assessment dashboard.",
                icon: Shield,
                features: [
                  "Free account setup",
                  "Secure & private",
                  "Instant access",
                ],
              },
              {
                step: 2,
                title: "Take Assessment",
                description:
                  "Complete our scientifically-validated cognitive assessment powered by advanced AI.",
                icon: Brain,
                features: [
                  "15-20 minute test",
                  "AI-powered evaluation",
                  "Medical-grade accuracy",
                ],
              },
              {
                step: 3,
                title: "Get Results",
                description:
                  "Receive comprehensive insights and personalized recommendations for your cognitive health.",
                icon: BarChart3,
                features: [
                  "Detailed analysis",
                  "Personalized tips",
                  "Track over time",
                ],
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                    <ul className="space-y-2 pt-2">
                      {item.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-slate-600"
                        >
                          <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl p-8 md:p-12 shadow-xl shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
                <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full" />
              </div>
              <div className="relative z-10 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of users taking control of their cognitive
                  health
                </p>
                {!session && (
                  <Link href="/auth/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 text-lg font-semibold bg-white text-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start Your Free Assessment
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 relative overflow-hidden w-full flex justify-center">
        <div className="absolute top-20 left-20 w-40 h-40 bg-emerald-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-cyan-100 rounded-full opacity-30 blur-3xl" />

        <div className="w-full max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700 tracking-wide">
                Our Advantages
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 text-balance">
              Why CogniScope?
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Cutting-edge technology meets healthcare expertise
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "AI-Powered Analysis",
                description:
                  "Advanced AI evaluates your cognitive performance with medical-grade accuracy and precision.",
                icon: Brain,
                features: [
                  "Medical-grade accuracy",
                  "Real-time analysis",
                  "Continuous learning",
                ],
                gradient: "from-emerald-500 to-teal-600",
              },
              {
                title: "Early Detection",
                description:
                  "Identify potential cognitive decline indicators before clinical symptoms appear.",
                icon: Target,
                features: [
                  "Proactive screening",
                  "Risk assessment",
                  "Early intervention",
                ],
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                title: "Personalized Reports",
                description:
                  "Get tailored recommendations and preventive strategies based on your unique results.",
                icon: BarChart3,
                features: [
                  "Custom insights",
                  "Actionable tips",
                  "Progress tracking",
                ],
                gradient: "from-indigo-500 to-violet-600",
              },
              {
                title: "Track Progress",
                description:
                  "Monitor your cognitive health journey over time with comprehensive trend analysis.",
                icon: LineChart,
                features: ["Historical data", "Trend analysis", "Goal setting"],
                gradient: "from-teal-500 to-emerald-600",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 h-full group">
                  <div className="flex items-start gap-5">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-bold text-slate-900">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed">
                        {benefit.description}
                      </p>
                      <ul className="space-y-2 pt-2">
                        {benefit.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-slate-600"
                          >
                            <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden w-full flex justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-10 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-5xl px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm font-medium text-emerald-400 tracking-wide">
                Get Started Today
              </span>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
                Take Control of Your
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Cognitive Health
                </span>
              </h2>
            </div>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Start your assessment today and gain valuable insights into your
              brain health with AI-powered analysis.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-8 py-6">
              {[
                { icon: Clock, text: "Quick 15-min test" },
                { icon: Lock, text: "100% Private & Secure" },
                { icon: Sparkles, text: "Instant Results" },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <item.icon className="w-5 h-5 text-emerald-400" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            {!session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-10 py-5 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    Start Your Free Assessment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <p className="mt-6 text-sm text-slate-400">
                  No credit card required • Free forever • Takes less than 20
                  minutes
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16 bg-slate-900" />
    </div>
  );
}
