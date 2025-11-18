"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "text-green-600 border-green-600";
      case "MODERATE":
        return "text-yellow-600 border-yellow-600";
      case "HIGH":
        return "text-orange-600 border-orange-600";
      case "CRITICAL":
        return "text-red-600 border-red-600";
      default:
        return "text-gray-600 border-gray-600";
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Assessment Reports
            </h1>
            <p className="text-lg text-gray-700">
              View your cognitive assessment history and detailed reports
            </p>
          </div>

          {reports.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">
                  No reports available yet. Complete an assessment to generate
                  your first report.
                </p>
                <Link href="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card variant="elevated">
                    <CardContent className="py-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-xl">
                              Report #{report.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-3 py-1 text-sm font-medium border-2 ${getRiskColor(
                                report.riskLevel
                              )}`}
                            >
                              {report.riskLevel} RISK
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(
                                report.generatedAt
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Questions:</span>{" "}
                              {report.testSession.totalQuestions}
                            </div>
                            <div>
                              <span className="font-medium">
                                Overall Score:
                              </span>{" "}
                              <span className="text-black font-bold">
                                {report.overallScore.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>{" "}
                              {Math.floor(
                                report.testSession.durationSeconds / 60
                              )}{" "}
                              min
                            </div>
                          </div>
                        </div>

                        <Link href={`/reports/${report.id}`}>
                          <Button variant="primary">View Full Report</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
