"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Shield,
  Stethoscope,
  Brain,
  Clock,
  HelpCircle,
  Target,
  Loader2,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  Navigation,
} from "lucide-react";

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

interface PsychiatristResult {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  osmUrl: string;
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
  const [locationQuery, setLocationQuery] = useState("");
  const [psychiatristResults, setPsychiatristResults] = useState<
    PsychiatristResult[]
  >([]);
  const [isSearchingPsychiatrists, setIsSearchingPsychiatrists] =
    useState(false);
  const [psychiatristSearchError, setPsychiatristSearchError] = useState("");
  const [hasSearchedPsychiatrists, setHasSearchedPsychiatrists] =
    useState(false);

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

  const getScoreColor = (score: number) => {
    if (score >= 75) return "from-emerald-500 to-teal-500";
    if (score >= 50) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getRiskStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-emerald-500 text-white";
      case "MODERATE":
        return "bg-amber-500 text-white";
      case "HIGH":
        return "bg-rose-500 text-white";
      case "CRITICAL":
        return "bg-red-700 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const fetchNearbyPsychiatrists = async () => {
    if (!locationQuery.trim()) {
      setPsychiatristSearchError("Please enter a location to continue.");
      return;
    }

    try {
      setIsSearchingPsychiatrists(true);
      setPsychiatristSearchError("");
      setHasSearchedPsychiatrists(true);

      const response = await fetch(
        `/api/psychiatrists?location=${encodeURIComponent(locationQuery.trim())}`,
      );
      const data = (await response.json()) as {
        results?: PsychiatristResult[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to search psychiatrists.");
      }

      setPsychiatristResults(data.results || []);
    } catch (error) {
      setPsychiatristResults([]);
      setPsychiatristSearchError(
        error instanceof Error
          ? error.message
          : "Failed to fetch psychiatrists. Please try again.",
      );
    } finally {
      setIsSearchingPsychiatrists(false);
    }
  };

  const ScoreBar = ({
    label,
    score,
    icon,
  }: {
    label: string;
    score: number;
    icon: React.ReactNode;
  }) => (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`h-full rounded-full ${getScoreBgColor(score)}`}
        />
      </div>
    </div>
  );

  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your report...</p>
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

        <div className="relative max-w-5xl mx-auto px-6 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/reports">
              <Button
                variant="ghost"
                className="mb-6 text-slate-300 border border-slate-600 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </Link>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-200">
                Assessment Report
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              Cognitive Assessment Report
            </h1>

            <p className="text-lg text-slate-300">
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
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Overall Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 shadow-sm text-center">
            <div
              className={`inline-flex w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(report.overallScore)} items-center justify-center mb-6`}
            >
              <span className="text-4xl font-bold text-white">
                {report.overallScore.toFixed(0)}%
              </span>
            </div>
            <div className="text-xl text-slate-600 mb-4 font-medium">
              Overall Cognitive Performance
            </div>
            <span
              className={`inline-block px-6 py-2 text-sm font-semibold rounded-full ${getRiskStyles(report.riskLevel)}`}
            >
              {report.riskLevel} Risk Level
            </span>
            {report.cognitiveAge && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="text-slate-500">
                  Estimated Cognitive Age:{" "}
                </span>
                <span className="font-bold text-2xl text-slate-900">
                  {report.cognitiveAge} years
                </span>
              </div>
            )}
          </div>

          {/* Summary & Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Brain className="w-6 h-6 text-emerald-600" />
              Assessment Summary
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              {report.summary}
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Questions
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {report.testSession.totalQuestions}
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Completed
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {report.testSession.answeredCount}
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Duration
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {Math.floor(report.testSession.durationSeconds / 60)} min
                </div>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Cognitive Domain Scores
            </h2>
            <ScoreBar
              label="Memory Recall"
              score={report.memoryScore}
              icon={<Brain className="w-4 h-4" />}
            />
            <ScoreBar
              label="Attention"
              score={report.attentionScore}
              icon={<Target className="w-4 h-4" />}
            />
            <ScoreBar
              label="Executive Function"
              score={report.executiveFunctionScore}
              icon={<Lightbulb className="w-4 h-4" />}
            />
            <ScoreBar
              label="Language Comprehension"
              score={report.languageScore}
              icon={<FileText className="w-4 h-4" />}
            />
            <ScoreBar
              label="Visual-Spatial Skills"
              score={report.visualSpatialScore}
              icon={<Target className="w-4 h-4" />}
            />
          </div>

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                Identified Strengths
              </h2>
              <ul className="space-y-4">
                {report.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 leading-relaxed">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas of Concern */}
          {report.concernAreas.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                Areas Requiring Attention
              </h2>
              <ul className="space-y-4">
                {report.concernAreas.map((concern, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-7 h-7 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="text-amber-900 leading-relaxed">
                      {concern}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-emerald-600" />
              Personalized Recommendations
            </h2>
            <ul className="space-y-4">
              {report.recommendations.map((recommendation, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed">
                    {recommendation}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preventive Steps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600" />
              Preventive Strategies
            </h2>
            <ul className="space-y-4">
              {report.preventiveSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="w-7 h-7 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-slate-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Indicators */}
          {report.clinicalIndicators.length > 0 && (
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Stethoscope className="w-6 h-6" />
                Clinical Consultation Recommended
              </h2>
              <p className="mb-6 text-rose-100">
                Based on your results, we recommend discussing the following
                with a healthcare professional:
              </p>
              <ul className="space-y-4">
                {report.clinicalIndicators.map((indicator, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-7 h-7 bg-white text-rose-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="leading-relaxed">{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.riskLevel === "CRITICAL" && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-red-900 mb-3 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-red-700" />
                Find Psychiatric Support Near You
              </h2>
              <p className="text-red-800 mb-6 leading-relaxed">
                Your report is marked as CRITICAL. Enter your location to get
                nearby psychiatrists. If you feel unsafe or in immediate danger,
                contact local emergency services right away.
              </p>

              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <Input
                  placeholder="Enter city, area, or postal code"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="rounded-xl border-red-300 focus:ring-red-500 focus:border-red-500"
                />
                <Button
                  variant="danger"
                  onClick={fetchNearbyPsychiatrists}
                  isLoading={isSearchingPsychiatrists}
                  loadingText="Searching..."
                  className="md:w-auto"
                >
                  Search
                </Button>
              </div>

              {psychiatristSearchError && (
                <p className="text-sm text-red-700 mb-4">
                  {psychiatristSearchError}
                </p>
              )}

              {hasSearchedPsychiatrists && !isSearchingPsychiatrists && (
                <div className="space-y-3">
                  {psychiatristResults.length === 0 ? (
                    <p className="text-sm text-red-800">
                      No psychiatrists found for this location. Try a nearby
                      city or region.
                    </p>
                  ) : (
                    psychiatristResults.map((doctor, idx) => (
                      <div
                        key={doctor.id}
                        className="bg-white border border-red-100 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {idx + 1}. {doctor.name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1 flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                              <span>{doctor.address}</span>
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-700">
                              <span className="inline-flex items-center gap-1">
                                <Navigation className="w-4 h-4 text-slate-500" />
                                {doctor.distanceKm.toFixed(1)} km away
                              </span>
                              {doctor.phone && (
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-4 h-4 text-slate-500" />
                                  {doctor.phone}
                                </span>
                              )}
                              {doctor.website && (
                                <a
                                  href={doctor.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 font-medium"
                                >
                                  <Globe className="w-4 h-4" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>

                          <a
                            href={doctor.osmUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-red-700 hover:text-red-800 whitespace-nowrap"
                          >
                            Open Map
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                Take Another Assessment
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="secondary" size="lg">
                View All Reports
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
