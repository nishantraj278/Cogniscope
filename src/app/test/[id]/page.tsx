"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  FileText,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Circle,
  Loader2,
  Brain,
} from "lucide-react";

const MCQ_QUESTION_PREVIEW_SECONDS = 20;
const VOICE_QUESTION_PREVIEW_SECONDS = 20;

interface Question {
  id: string;
  questionType: string;
  questionText: string;
  options: string[];
  orderIndex: number;
  category: string;
  difficulty: string;
}

interface TestSession {
  id: string;
  testType: string;
  totalQuestions: number;
  answeredCount: number;
  questions: Question[];
  answers: Array<{ questionId: string; userAnswer: string }>;
}

export default function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isCurrentAnswerSubmitted, setIsCurrentAnswerSubmitted] =
    useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [audioData, setAudioData] = useState<string | null>(null);
  const [hasAudioRecording, setHasAudioRecording] = useState(false);
  const [isQuestionPreviewPhase, setIsQuestionPreviewPhase] = useState(false);
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState(
    MCQ_QUESTION_PREVIEW_SECONDS,
  );

  useEffect(() => {
    fetchTestSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    if (testSession && testSession.questions[currentIndex]) {
      const existingAnswer = testSession.answers.find(
        (a) => a.questionId === testSession.questions[currentIndex].id,
      );
      setSelectedAnswer(existingAnswer?.userAnswer || "");
      setIsCurrentAnswerSubmitted(!!existingAnswer);
      setAudioData(null);
      setHasAudioRecording(false);
    }
  }, [currentIndex, testSession]);

  useEffect(() => {
    if (!testSession || !testSession.questions[currentIndex]) return;

    const currentQuestion = testSession.questions[currentIndex];
    const isTimedMcqQuestion =
      testSession.testType === "MCQ" &&
      currentQuestion.questionType !== "VOICE_ANSWER";
    const isTimedVoiceQuestion =
      testSession.testType === "VOICE" &&
      currentQuestion.questionType === "VOICE_ANSWER";
    const isTimedQuestion = isTimedMcqQuestion || isTimedVoiceQuestion;
    const previewDuration = isTimedMcqQuestion
      ? MCQ_QUESTION_PREVIEW_SECONDS
      : VOICE_QUESTION_PREVIEW_SECONDS;

    if (!isTimedQuestion) {
      setIsQuestionPreviewPhase(false);
      return;
    }

    setIsQuestionPreviewPhase(true);
    setPreviewSecondsLeft(previewDuration);

    const intervalId = setInterval(() => {
      setPreviewSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeoutId = setTimeout(() => {
      setIsQuestionPreviewPhase(false);
      clearInterval(intervalId);
    }, previewDuration * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [currentIndex, testSession?.questions, testSession?.testType]);

  const fetchTestSession = async () => {
    try {
      console.log("Client: Fetching test with ID:", id);
      const response = await fetch(`/api/tests/${id}`);
      console.log("Client: Response status:", response.status);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", response.status, errorData);
        throw new Error(
          `Failed to fetch test session: ${
            errorData.error || response.statusText
          }`,
        );
      }
      const data = await response.json();
      console.log("Client: Received test data:", data);
      setTestSession(data);
    } catch (error) {
      console.error("Error:", error);
      alert(
        `Failed to load test: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Redirecting to dashboard.`,
      );
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = async () => {
    if (!testSession) return;

    const currentQuestion = testSession.questions[currentIndex];
    const isVoiceQuestion = currentQuestion.questionType === "VOICE_ANSWER";

    if (isVoiceQuestion && !audioData) return;
    if (!isVoiceQuestion && !selectedAnswer) return;

    const responseTime = Date.now() - startTime;

    setIsSavingAnswer(true);
    try {
      const response = await fetch(`/api/tests/${id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: isVoiceQuestion ? "[Voice Answer]" : selectedAnswer,
          responseTime,
          audioData: isVoiceQuestion ? audioData : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answer");
      }

      const updatedAnswers = testSession.answers.filter(
        (a) => a.questionId !== currentQuestion.id,
      );
      updatedAnswers.push({
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
      });

      setTestSession({
        ...testSession,
        answers: updatedAnswers,
        answeredCount: updatedAnswers.length,
      });

      setIsCurrentAnswerSubmitted(true);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to save answer:", error);
      alert("Failed to save answer. Please try again.");
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < testSession!.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testSession) return;

    const unanswered =
      testSession.questions.length - testSession.answers.length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered questions. Submit anyway?`,
      );
      if (!confirm) return;
    }

    await saveAnswer();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tests/${id}/submit`, {
        method: "POST",
      });

      const report = await response.json();
      router.push(`/reports/${report.id}`);
    } catch (error) {
      console.error("Failed to submit test:", error);
      alert("Failed to submit test. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading || !testSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = testSession.questions[currentIndex];
  const progress = ((currentIndex + 1) / testSession.totalQuestions) * 100;
  const isLastQuestion = currentIndex === testSession.questions.length - 1;
  const isTimedMcqQuestion =
    testSession.testType === "MCQ" &&
    currentQuestion.questionType !== "VOICE_ANSWER";
  const isTimedVoiceQuestion =
    testSession.testType === "VOICE" &&
    currentQuestion.questionType === "VOICE_ANSWER";
  const showQuestionText =
    !(isTimedMcqQuestion || isTimedVoiceQuestion) || isQuestionPreviewPhase;
  const showOptions = !isTimedMcqQuestion || !isQuestionPreviewPhase;
  const showVoiceRecorder = !isTimedVoiceQuestion || !isQuestionPreviewPhase;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="w-full flex justify-center px-6 md:px-8 relative z-10">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    {testSession.testType === "VOICE" ? (
                      <Mic className="w-5 h-5 text-white" />
                    ) : (
                      <FileText className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {testSession.testType === "VOICE" ? "Voice" : "MCQ"}{" "}
                    Assessment
                  </h1>
                </div>
                <p className="text-sm text-slate-400 ml-13">
                  {testSession.testType === "VOICE"
                    ? "Answer questions using your voice"
                    : "Select the best answer for each question"}
                </p>
              </div>
              <div className="text-sm font-semibold bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {currentIndex + 1} / {testSession.totalQuestions}
              </div>
            </div>
            <ProgressBar progress={progress} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center px-6 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-4xl">
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-200/60 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
                    {currentQuestion.category.replace("_", " ")}
                  </span>
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide ${
                      currentQuestion.difficulty === "EASY"
                        ? "bg-emerald-50 text-emerald-700"
                        : currentQuestion.difficulty === "MEDIUM"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>

                {showQuestionText && (
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                )}

                {(isTimedMcqQuestion || isTimedVoiceQuestion) &&
                  isQuestionPreviewPhase && (
                    <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6">
                      {isTimedMcqQuestion
                        ? `Memorize this question. Options will appear in ${previewSecondsLeft}s.`
                        : `Memorize this question. Recording will start in ${previewSecondsLeft}s.`}
                    </p>
                  )}

                {/* Voice Question */}
                {currentQuestion.questionType === "VOICE_ANSWER" ? (
                  showVoiceRecorder ? (
                    <VoiceRecorder
                      onRecordingComplete={(blob, base64) => {
                        setAudioData(base64);
                        setHasAudioRecording(true);
                      }}
                      disabled={isCurrentAnswerSubmitted}
                    />
                  ) : null
                ) : showOptions ? (
                  /* Multiple Choice Options */
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full text-left p-5 rounded-xl transition-all duration-200 ${
                          selectedAnswer === option
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={`font-bold text-sm shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              selectedAnswer === option
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            className={`text-base leading-relaxed ${
                              selectedAnswer === option
                                ? "text-white"
                                : "text-slate-700"
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Answer Submission */}
          <div className="mb-6">
            <Button
              variant={isCurrentAnswerSubmitted ? "secondary" : "danger"}
              onClick={saveAnswer}
              disabled={
                (currentQuestion.questionType === "VOICE_ANSWER"
                  ? !hasAudioRecording
                  : !selectedAnswer) ||
                isSavingAnswer ||
                isCurrentAnswerSubmitted
              }
              isLoading={isSavingAnswer}
              loadingText="Submitting..."
              size="lg"
              className={`w-full text-lg ${
                isCurrentAnswerSubmitted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
              }`}
            >
              {isCurrentAnswerSubmitted ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Answer Submitted
                </span>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="lg"
              className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="text-center px-6 py-3 bg-white rounded-xl border border-slate-200">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Progress
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {testSession.answeredCount} / {testSession.totalQuestions}
              </div>
              <div className="text-xs text-slate-500">Questions Answered</div>
            </div>

            {isLastQuestion ? (
              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Flag className="w-4 h-4 mr-2" />
                )}
                Finish Test
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleNext}
                size="lg"
                className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/60">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {testSession.questions.map((q, idx) => {
                const isAnswered = testSession.answers.some(
                  (a) => a.questionId === q.id,
                );
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isCurrent
                        ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                        : isAnswered
                          ? "bg-slate-800 text-white hover:bg-slate-700"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-md" />
                <span className="text-sm text-slate-600">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-800 rounded-md" />
                <span className="text-sm text-slate-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded-md" />
                <span className="text-sm text-slate-600">Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
