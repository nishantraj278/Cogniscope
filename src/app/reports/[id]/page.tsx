"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-600";
      case "MODERATE":
        return "bg-yellow-600";
      case "HIGH":
        return "bg-orange-600";
      case "CRITICAL":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{score.toFixed(1)}%</span>
      </div>
      <div className="w-full h-6 bg-gray-200 border-2 border-black">
        <div
          className={`h-full ${
            score >= 75
              ? "bg-green-600"
              : score >= 50
              ? "bg-yellow-600"
              : "bg-red-600"
          } transition-all duration-1000`}
          style={{ width: `${score}%` }}
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/reports">
              <Button variant="ghost" className="mb-4">
                ← Back to Reports
              </Button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              Cognitive Assessment Report
            </h1>
            <p className="text-gray-600">
              Generated on {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Score Card */}
          <Card variant="elevated" className="mb-8">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="text-6xl font-bold mb-4">
                  {report.overallScore.toFixed(1)}%
                </div>
                <div className="text-xl mb-4">
                  Overall Cognitive Performance
                </div>
                <div
                  className={`inline-block px-6 py-3 text-white text-lg font-bold ${getRiskColor(
                    report.riskLevel
                  )}`}
                >
                  {report.riskLevel} RISK
                </div>
                {report.cognitiveAge && (
                  <div className="mt-4 text-gray-600">
                    Cognitive Age:{" "}
                    <span className="font-bold text-black">
                      {report.cognitiveAge} years
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card variant="bordered" className="mb-8">
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{report.summary}</p>
              <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-gray-200">
                <div>
                  <div className="text-sm text-gray-600">Questions</div>
                  <div className="text-2xl font-bold">
                    {report.testSession.totalQuestions}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-2xl font-bold">
                    {report.testSession.answeredCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(report.testSession.durationSeconds / 60)} min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card variant="bordered" className="mb-8">
            <CardHeader>
              <CardTitle>Cognitive Domain Scores</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <Card variant="bordered" className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">●</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Areas of Concern */}
          {report.concernAreas.length > 0 && (
            <Card variant="bordered" className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-red-600">!</span> Areas Requiring
                  Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.concernAreas.map((concern, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-600 mr-3 mt-1">●</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card variant="bordered" className="mb-8">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="bg-black text-white w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Preventive Steps */}
          <Card variant="bordered" className="mb-8">
            <CardHeader>
              <CardTitle>Preventive Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.preventiveSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-black mr-3 mt-1">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Clinical Indicators */}
          {report.clinicalIndicators.length > 0 && (
            <Card variant="elevated" className="mb-8 border-2 border-red-600">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-600">
                  ⚠️ Clinical Consultation Recommended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 font-medium">
                  Based on your results, we recommend discussing the following
                  with a healthcare professional:
                </p>
                <ul className="space-y-3">
                  {report.clinicalIndicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-600 mr-3 mt-1">●</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="primary" className="w-full" size="lg">
                Take Another Assessment
              </Button>
            </Link>
            <Link href="/reports" className="flex-1">
              <Button variant="secondary" className="w-full" size="lg">
                View All Reports
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
