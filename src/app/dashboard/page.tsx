"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  FileText,
  Mic,
  BarChart3,
  CheckCircle2,
  Target,
  Clock,
  ArrowRight,
  Brain,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface TestSession {
  id: string;
  testType: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalQuestions: number;
  answeredCount: number;
  report: {
    id: string;
    overallScore: number;
    riskLevel: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingMCQ, setIsCreatingMCQ] = useState(false);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTestSessions();
    }
  }, [session]);

  const fetchTestSessions = async () => {
    try {
      const response = await fetch("/api/tests");
      const data = await response.json();
      setTestSessions(data);
    } catch (error) {
      console.error("Failed to fetch test sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTest = async (testType: "MCQ" | "VOICE") => {
    const setIsCreating =
      testType === "MCQ" ? setIsCreatingMCQ : setIsCreatingVoice;
    setIsCreating(true);
    try {
      console.log(`Creating new ${testType} test...`);
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numberOfQuestions: 20, testType }),
      });

      console.log("Create test response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Failed to create test:", response.status, errorData);
        alert(
          `Failed to create test: ${errorData.error || response.statusText}`,
        );
        return;
      }

      const testSession = await response.json();
      console.log("Created test session:", testSession);
      console.log("Navigating to test ID:", testSession.id);

      if (!testSession.id) {
        console.error("No test ID in response:", testSession);
        alert("Invalid test session created");
        return;
      }

      router.push(`/test/${testSession.id}`);
    } catch (error) {
      console.error("Failed to create test:", error);
      alert("Failed to create test. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const completedTests = testSessions.filter((t) => t.status === "COMPLETED");
  const inProgressTests = testSessions.filter(
    (t) => t.status === "IN_PROGRESS",
  );

  const averageScore =
    completedTests.length > 0
      ? completedTests.reduce(
          (sum, t) => sum + (t.report?.overallScore || 0),
          0,
        ) / completedTests.length
      : 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-slate-300">
                Active Session
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight text-balance">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {session?.user?.name || "User"}
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto text-pretty">
              Continue your cognitive health journey. Take an assessment to
              track your mental wellness.
            </p>

            {/* Test Type Selection */}
            <div className="mb-10">
              <p className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">
                Start a New Assessment
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createNewTest("MCQ")}
                  disabled={isCreatingMCQ}
                  className="group relative flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block">MCQ Test</span>
                    <span className="text-xs text-slate-500 font-normal">
                      Multiple choice
                    </span>
                  </div>
                  {isCreatingMCQ && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createNewTest("VOICE")}
                  disabled={isCreatingVoice}
                  className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block">Voice Test</span>
                    <span className="text-xs text-white/70 font-normal">
                      Answer verbally
                    </span>
                  </div>
                  {isCreatingVoice && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </motion.button>
              </div>
            </div>

            {/* View Reports Link */}
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View All Reports</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Statistics Section */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Statistics
                </h2>
                <p className="text-slate-500 text-sm">
                  Track your cognitive assessment journey
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300">
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Total Tests
                    </p>
                    <p className="text-5xl font-bold text-slate-900">
                      {testSessions.length}
                    </p>
                    <p className="text-sm text-slate-400">assessments taken</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300">
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Completed
                    </p>
                    <p className="text-5xl font-bold text-emerald-600">
                      {completedTests.length}
                    </p>
                    <p className="text-sm text-slate-400">tests finished</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-slate-300/50 transition-all duration-300">
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Average Score
                    </p>
                    <p className="text-5xl font-bold text-cyan-600">
                      {averageScore > 0 ? `${averageScore.toFixed(0)}%` : "--"}
                    </p>
                    <p className="text-sm text-slate-400">
                      overall performance
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* In Progress Tests */}
          {inProgressTests.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    In Progress
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Continue where you left off
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {inProgressTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 hover:shadow-md transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm">
                              {test.testType === "VOICE" ? (
                                <Mic className="w-5 h-5 text-amber-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                Test #{test.id.slice(0, 8)}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {test.testType === "VOICE"
                                  ? "Voice Test"
                                  : "MCQ Test"}
                              </p>
                            </div>
                            <span className="ml-auto lg:ml-0 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                              Active
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 mb-4">
                            Started{" "}
                            {new Date(test.startedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-amber-600">
                                {test.answeredCount}/{test.totalQuestions}{" "}
                                Questions
                              </span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(test.answeredCount / test.totalQuestions) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <Link href={`/test/${test.id}`}>
                          <Button
                            variant="primary"
                            size="lg"
                            className="whitespace-nowrap bg-amber-500 hover:bg-amber-600"
                          >
                            Continue Test
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment History */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Assessment History
                </h2>
                <p className="text-slate-500 text-sm">
                  Your recent cognitive assessments
                </p>
              </div>
            </div>

            {testSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-12 text-center border border-slate-200/50"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No Assessments Yet
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Start your first cognitive assessment to track your mental
                  wellbeing and monitor your progress over time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => createNewTest("MCQ")}
                    isLoading={isCreatingMCQ}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Start MCQ Test
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => createNewTest("VOICE")}
                    isLoading={isCreatingVoice}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Voice Test
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {testSessions.slice(0, 5).map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                              {test.testType === "VOICE" ? (
                                <Mic className="w-5 h-5 text-slate-600" />
                              ) : (
                                <FileText className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                #{test.id.slice(0, 8)}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {test.testType === "VOICE"
                                  ? "Voice Test"
                                  : "MCQ Test"}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                test.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {test.status === "COMPLETED"
                                ? "Completed"
                                : "In Progress"}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 mb-4">
                            {new Date(test.startedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>

                          {test.report && (
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {test.report.overallScore.toFixed(0)}%
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                                    Score
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {test.report.overallScore.toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <div className="h-10 w-px bg-slate-200" />

                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                  Risk Level
                                </p>
                                <span
                                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                    test.report.riskLevel === "LOW"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : test.report.riskLevel === "MODERATE"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {test.report.riskLevel}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          {test.status === "IN_PROGRESS" ? (
                            <Link href={`/test/${test.id}`}>
                              <Button
                                variant="primary"
                                size="lg"
                                className="whitespace-nowrap"
                              >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          ) : test.report ? (
                            <Link
                              href={`/reports/${test.report.id || test.id}`}
                            >
                              <Button
                                variant="secondary"
                                size="lg"
                                className="whitespace-nowrap"
                              >
                                View Report
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
