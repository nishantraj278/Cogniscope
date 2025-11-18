"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface TestSession {
  id: string;
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
  const [isCreating, setIsCreating] = useState(false);

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

  const createNewTest = async () => {
    setIsCreating(true);
    try {
      console.log("Creating new test...");
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numberOfQuestions: 20 }),
      });

      console.log("Create test response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to create test:", response.status, errorData);
        alert(`Failed to create test: ${errorData.error || response.statusText}`);
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
    (t) => t.status === "IN_PROGRESS"
  );

  const averageScore =
    completedTests.length > 0
      ? completedTests.reduce(
          (sum, t) => sum + (t.report?.overallScore || 0),
          0
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-gray-700">
              Welcome back, {session?.user?.name || session?.user?.email}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-2">Total Tests</div>
                <div className="text-4xl font-bold">{testSessions.length}</div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-2">Completed</div>
                <div className="text-4xl font-bold text-green-600">
                  {completedTests.length}
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-2">Average Score</div>
                <div className="text-4xl font-bold text-red-600">
                  {averageScore > 0 ? averageScore.toFixed(1) : "--"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={createNewTest}
                  isLoading={isCreating}
                  className="flex-1"
                >
                  Start New Assessment
                </Button>
                <Link href="/reports" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">
                    View All Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* In Progress Tests */}
          {inProgressTests.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Continue Testing</h2>
              <div className="space-y-4">
                {inProgressTests.map((test) => (
                  <Card key={test.id} variant="bordered">
                    <CardContent className="py-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg mb-2">
                            Test #{test.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Started:{" "}
                            {new Date(test.startedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Progress: {test.answeredCount}/{test.totalQuestions}{" "}
                            questions
                          </div>
                        </div>
                        <Link href={`/test/${test.id}`}>
                          <Button variant="primary">Continue</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tests */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Assessments</h2>
            {testSessions.length === 0 ? (
              <Card variant="bordered">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven&apos;t taken any assessments yet.
                  </p>
                  <Button variant="primary" onClick={createNewTest}>
                    Take Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {testSessions.slice(0, 5).map((test) => (
                  <Card key={test.id} variant="bordered">
                    <CardContent className="py-6">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg">
                              Test #{test.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-3 py-1 text-xs font-medium border-2 ${
                                test.status === "COMPLETED"
                                  ? "border-green-600 text-green-600"
                                  : "border-yellow-600 text-yellow-600"
                              }`}
                            >
                              {test.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(test.startedAt).toLocaleDateString()}
                          </div>
                          {test.report && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">
                                Score: {test.report.overallScore.toFixed(1)}
                              </span>
                              <span className="mx-2">•</span>
                              <span
                                className={`text-sm font-medium ${
                                  test.report.riskLevel === "LOW"
                                    ? "text-green-600"
                                    : test.report.riskLevel === "MODERATE"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {test.report.riskLevel} Risk
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {test.status === "IN_PROGRESS" ? (
                            <Link href={`/test/${test.id}`}>
                              <Button variant="primary">Continue</Button>
                            </Link>
                          ) : test.report ? (
                            <Link
                              href={`/reports/${test.report.id || test.id}`}
                            >
                              <Button variant="secondary">View Report</Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
