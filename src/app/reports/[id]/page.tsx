"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface Report {
  id: string;
  overallScore: number;
  riskLevel: string;
  cognitiveAge: number | null;
  memoryScore: number;
  attentionScore: number;
  executiveFunctionScore: number;
  languageScore: number;
  visualSpatialScore: number;
  summary: string;
  strengths: string[];
  concernAreas: string[];
  recommendations: string[];
  clinicalIndicators: string[];
  preventiveSteps: string[];
  generatedAt: string;
  testSession: {
    startedAt: string;
    completedAt: string;
    totalQuestions: number;
    answeredCount: number;
    durationSeconds: number;
  };
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load report. Redirecting to reports page.");
      router.push("/reports");
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="mb-6">
      <div className="flex justify-between mb-3">
        <span className="text-base font-bold">{label}</span>
        <span className="text-base font-black">{score.toFixed(1)}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`h-full ${
            score >= 75
              ? "bg-black"
              : score >= 50
              ? "bg-gray-700"
              : "bg-red-600"
          }`}
        />
      </div>
    </div>
  );

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading report...</div>
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

        <div className="relative w-full flex justify-center px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl w-full"
          >
            <Link href="/reports">
              <Button
                variant="ghost"
                className="mb-6 text-white border-2 border-white hover:bg-white hover:text-black"
              >
                ← Back to Reports
              </Button>
            </Link>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-3xl">📋</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              Assessment Report
            </h1>

            <p className="text-xl text-gray-300">
              Generated on{" "}
              {new Date(report.generatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
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
          {/* Overall Score Card */}
          <div className="bg-white rounded-3xl p-12 shadow-lg mb-12 text-center">
            <div className="text-8xl font-black mb-6">
              {report.overallScore.toFixed(1)}%
            </div>
            <div className="text-2xl mb-6 font-bold text-gray-600">
              Overall Cognitive Performance
            </div>
            <div
              className={`inline-block px-8 py-3 text-white text-lg font-black rounded-full uppercase ${
                report.riskLevel === "LOW"
                  ? "bg-black"
                  : report.riskLevel === "MODERATE"
                  ? "bg-gray-800"
                  : "bg-red-600"
              }`}
            >
              {report.riskLevel} Risk
            </div>
            {report.cognitiveAge && (
              <div className="mt-6 text-lg">
                <span className="text-gray-600">Cognitive Age: </span>
                <span className="font-black text-2xl text-black">
                  {report.cognitiveAge} years
                </span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
            <h2 className="text-3xl font-black mb-6">Assessment Summary</h2>
            <p className="text-lg leading-relaxed mb-8">{report.summary}</p>

            <div className="grid md:grid-cols-3 gap-8 pt-8 border-t-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-500 uppercase mb-2">
                  Questions
                </div>
                <div className="text-4xl font-black">
                  {report.testSession.totalQuestions}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-500 uppercase mb-2">
                  Completed
                </div>
                <div className="text-4xl font-black">
                  {report.testSession.answeredCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-500 uppercase mb-2">
                  Duration
                </div>
                <div className="text-4xl font-black">
                  {Math.floor(report.testSession.durationSeconds / 60)} min
                </div>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
            <h2 className="text-3xl font-black mb-8">
              Cognitive Domain Scores
            </h2>
            <ScoreBar label="Memory Recall" score={report.memoryScore} />
            <ScoreBar label="Attention" score={report.attentionScore} />
            <ScoreBar
              label="Executive Function"
              score={report.executiveFunctionScore}
            />
            <ScoreBar
              label="Language Comprehension"
              score={report.languageScore}
            />
            <ScoreBar
              label="Visual-Spatial Skills"
              score={report.visualSpatialScore}
            />
          </div>

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                <span className="text-4xl">✅</span> Strengths
              </h2>
              <ul className="space-y-4">
                {report.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                      {idx + 1}
                    </span>
                    <span className="text-lg leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas of Concern */}
          {report.concernAreas.length > 0 && (
            <div className="bg-red-50 rounded-3xl p-10 shadow-lg mb-12">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3 text-red-600">
                <span className="text-4xl">⚠️</span> Areas Requiring Attention
              </h2>
              <ul className="space-y-4">
                {report.concernAreas.map((concern, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                      !
                    </span>
                    <span className="text-lg leading-relaxed">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
              <span className="text-4xl">💡</span> Personalized Recommendations
            </h2>
            <ul className="space-y-4">
              {report.recommendations.map((recommendation, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  <span className="text-lg leading-relaxed">
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preventive Steps */}
          <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
              <span className="text-4xl">🛡️</span> Preventive Strategies
            </h2>
            <ul className="space-y-4">
              {report.preventiveSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                    ✓
                  </span>
                  <span className="text-lg leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Indicators */}
          {report.clinicalIndicators.length > 0 && (
            <div className="bg-red-600 text-white rounded-3xl p-10 shadow-lg mb-12">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                <span className="text-4xl">🏥</span> Clinical Consultation
                Recommended
              </h2>
              <p className="mb-6 text-lg font-medium">
                Based on your results, we recommend discussing the following
                with a healthcare professional:
              </p>
              <ul className="space-y-4">
                {report.clinicalIndicators.map((indicator, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-1">
                      !
                    </span>
                    <span className="text-lg leading-relaxed">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/dashboard">
              <Button variant="danger" size="lg" className="text-lg px-10">
                Take Another Assessment
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="secondary" size="lg" className="text-lg px-10">
                View All Reports
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
