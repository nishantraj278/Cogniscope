"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background */}
      <div
        className="relative bg-black text-white overflow-hidden"
        style={{ marginLeft: 0 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full flex justify-center px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-6xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">You&apos;re logged in</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
              Welcome Back
            </h1>

            <p className="text-2xl text-gray-300 mb-8">
              {session?.user?.name || session?.user?.email}
            </p>

            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-6 text-gray-300">
                Choose Your Test Type:
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => createNewTest("MCQ")}
                    isLoading={isCreatingMCQ}
                    className="text-lg px-8 min-w-60"
                  >
                    📝 MCQ Test
                  </Button>
                  <p className="text-sm text-gray-400">
                    Multiple choice questions
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => createNewTest("VOICE")}
                    isLoading={isCreatingVoice}
                    className="text-lg px-8 min-w-60"
                  >
                    🎤 Voice Test
                  </Button>
                  <p className="text-sm text-gray-400">
                    Answer with your voice
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Link href="/reports">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-lg px-8 text-white border-2 border-white hover:bg-white hover:text-black"
                >
                  📊 View Reports
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-6xl"
        >
          {/* Stats Overview */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Your Statistics</h2>
            <p className="text-gray-600 text-lg mb-12">
              Track your cognitive assessment journey
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📊</span>
                  </div>
                  <div className="text-6xl font-black mb-2">
                    {testSessions.length}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-600">
                    Total Tests
                  </div>
                  <div className="mt-4 h-2 w-24 bg-black rounded-full mx-auto"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <div className="text-6xl font-black mb-2 text-black">
                    {completedTests.length}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-600">
                    Completed
                  </div>
                  <div className="mt-4 h-2 w-24 bg-black rounded-full mx-auto"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🎯</span>
                  </div>
                  <div className="text-6xl font-black mb-2 text-red-600">
                    {averageScore > 0 ? `${averageScore.toFixed(0)}%` : "--"}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-gray-600">
                    Average Score
                  </div>
                  <div className="mt-4 h-2 w-24 bg-red-600 rounded-full mx-auto"></div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* In Progress Tests */}
          {inProgressTests.length > 0 && (
            <div className="mb-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-red-50 rounded-full px-6 py-3 mb-4 shadow-md">
                  <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                  <span className="font-black text-red-600 uppercase tracking-wide">
                    In Progress
                  </span>
                </div>
                <h2 className="text-4xl font-black">
                  Continue Your Assessment
                </h2>
              </div>

              <div className="space-y-6 max-w-4xl mx-auto">
                {inProgressTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-2xl font-black">
                              {test.testType === "VOICE" ? "🎤" : "📝"} Test #
                              {test.id.slice(0, 8)}
                            </div>
                            <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded-full uppercase">
                              Active
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                              {test.testType === "VOICE"
                                ? "Voice Test"
                                : "MCQ Test"}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-6 font-medium">
                            Started:{" "}
                            {new Date(test.startedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold">
                              <span>Progress</span>
                              <span className="text-red-600">
                                {test.answeredCount}/{test.totalQuestions}{" "}
                                Questions
                              </span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (test.answeredCount / test.totalQuestions) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <Link href={`/test/${test.id}`}>
                          <Button
                            variant="danger"
                            size="lg"
                            className="text-lg px-10 whitespace-nowrap"
                          >
                            Continue Test →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tests */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">Assessment History</h2>
              <p className="text-gray-600 text-lg">
                Your recent cognitive assessments
              </p>
            </div>

            {testSessions.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-3xl p-16 text-center shadow-lg">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <span className="text-6xl">🧠</span>
                  </div>
                  <h3 className="text-3xl font-black mb-4">
                    No Assessments Yet
                  </h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Start your first cognitive assessment to track your mental
                    wellbeing
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => createNewTest("MCQ")}
                      isLoading={isCreatingMCQ}
                      className="text-lg px-10"
                    >
                      📝 MCQ Test
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => createNewTest("VOICE")}
                      isLoading={isCreatingVoice}
                      className="text-lg px-10"
                    >
                      🎤 Voice Test
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {testSessions.slice(0, 5).map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl font-black">
                              {test.testType === "VOICE" ? "🎤" : "📝"} #
                              {test.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-4 py-1.5 text-xs font-black rounded-full uppercase ${
                                test.status === "COMPLETED"
                                  ? "bg-black text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {test.status === "COMPLETED"
                                ? "Completed"
                                : "In Progress"}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                              {test.testType === "VOICE"
                                ? "Voice Test"
                                : "MCQ Test"}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-4 font-medium">
                            {new Date(test.startedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>

                          {test.report && (
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                                  <span className="text-white font-black text-sm">
                                    {test.report.overallScore.toFixed(0)}%
                                  </span>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-gray-500 uppercase">
                                    Score
                                  </div>
                                  <div className="text-lg font-black">
                                    {test.report.overallScore.toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              <div className="h-12 w-px bg-gray-300"></div>

                              <div>
                                <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                                  Risk Level
                                </div>
                                <span
                                  className={`inline-block px-4 py-2 text-sm font-black rounded-full ${
                                    test.report.riskLevel === "LOW"
                                      ? "bg-black text-white"
                                      : test.report.riskLevel === "MODERATE"
                                        ? "bg-gray-800 text-white"
                                        : "bg-red-600 text-white"
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
                                variant="danger"
                                size="lg"
                                className="whitespace-nowrap"
                              >
                                Continue →
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
