"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  Clock,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";

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

  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "MODERATE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "CRITICAL":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-200">
                Assessment History
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Your Reports
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Track your cognitive health journey with comprehensive assessment
              reports
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 lg:p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No Reports Yet
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Complete your first cognitive assessment to generate a
                comprehensive report with personalized insights.
              </p>
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Start Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                >
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <span className="text-lg font-semibold text-slate-900">
                              Report #{report.id.slice(0, 8)}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskStyles(report.riskLevel)}`}
                          >
                            {report.riskLevel} Risk
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                          {/* Score */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreColor(report.overallScore)} flex items-center justify-center`}
                            >
                              <span className="text-white font-bold text-sm">
                                {report.overallScore.toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Score
                              </div>
                              <div className="text-base font-bold text-slate-900">
                                {report.overallScore.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Date
                              </div>
                              <div className="text-sm font-semibold text-slate-700">
                                {new Date(
                                  report.generatedAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                          {/* Questions */}
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Questions
                              </div>
                              <div className="text-sm font-semibold text-slate-700">
                                {report.testSession.totalQuestions}
                              </div>
                            </div>
                          </div>

                          <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                          {/* Duration */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Duration
                              </div>
                              <div className="text-sm font-semibold text-slate-700">
                                {Math.floor(
                                  report.testSession.durationSeconds / 60,
                                )}{" "}
                                min
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link href={`/reports/${report.id}`}>
                        <Button
                          variant="primary"
                          size="md"
                          className="whitespace-nowrap group-hover:shadow-lg transition-shadow"
                        >
                          View Report
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
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
