"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface Report {
  id: string;
  overallScore: number;
  riskLevel: string;
  generatedAt: string;
  testSession: {
    startedAt: string;
    completedAt: string;
    totalQuestions: number;
    durationSeconds: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full flex justify-center px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-4xl">📊</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
              Your Reports
            </h1>

            <p className="text-2xl text-gray-300">
              Comprehensive cognitive assessment history
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-5xl"
        >
          {reports.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-16 text-center shadow-lg">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-6xl">📊</span>
              </div>
              <h3 className="text-3xl font-black mb-4">No Reports Yet</h3>
              <p className="text-lg text-gray-600 mb-8">
                Complete an assessment to generate your first cognitive report
              </p>
              <Link href="/dashboard">
                <Button variant="danger" size="lg" className="text-lg px-10">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl font-black">
                            #{report.id.slice(0, 8)}
                          </span>
                          <span
                            className={`px-4 py-1.5 text-xs font-black rounded-full uppercase ${
                              report.riskLevel === "LOW"
                                ? "bg-black text-white"
                                : report.riskLevel === "MODERATE"
                                ? "bg-gray-800 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {report.riskLevel} Risk
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white font-black text-sm">
                                {report.overallScore.toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-500 uppercase">
                                Score
                              </div>
                              <div className="text-lg font-black">
                                {report.overallScore.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          <div className="h-12 w-px bg-gray-300"></div>

                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase">
                              Date
                            </div>
                            <div className="text-sm font-bold">
                              {new Date(report.generatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>

                          <div className="h-12 w-px bg-gray-300"></div>

                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase">
                              Questions
                            </div>
                            <div className="text-sm font-bold">
                              {report.testSession.totalQuestions}
                            </div>
                          </div>

                          <div className="h-12 w-px bg-gray-300"></div>

                          <div>
                            <div className="text-xs font-bold text-gray-500 uppercase">
                              Duration
                            </div>
                            <div className="text-sm font-bold">
                              {Math.floor(
                                report.testSession.durationSeconds / 60
                              )}{" "}
                              min
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link href={`/reports/${report.id}`}>
                        <Button
                          variant="danger"
                          size="lg"
                          className="whitespace-nowrap"
                        >
                          View Report →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
