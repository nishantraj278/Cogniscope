"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { motion, AnimatePresence } from "framer-motion";

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
      // Reset voice data when switching questions
      setAudioData(null);
      setHasAudioRecording(false);
    }
  }, [currentIndex, testSession]);

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

    // Validate based on question type
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

      // Update local state
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

      // Mark as submitted
      setIsCurrentAnswerSubmitted(true);

      // Reset start time for next question
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading test...</div>
      </div>
    );
  }

  const currentQuestion = testSession.questions[currentIndex];
  const progress = ((currentIndex + 1) / testSession.totalQuestions) * 100;
  const isLastQuestion = currentIndex === testSession.questions.length - 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Header */}
      <div className="bg-black text-white py-6">
        <div className="w-full flex justify-center px-8">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black">
                  {testSession.testType === "VOICE" ? "🎤 Voice" : "📝 MCQ"}{" "}
                  Assessment
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {testSession.testType === "VOICE"
                    ? "Answer questions using your voice"
                    : "Select the best answer for each question"}
                </p>
              </div>
              <div className="text-sm font-bold bg-white/20 px-4 py-2 rounded-full">
                {currentIndex + 1} / {testSession.totalQuestions}
              </div>
            </div>
            <ProgressBar progress={progress} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex justify-center px-8 py-12">
        <div className="w-full max-w-4xl">
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-3xl p-10 shadow-lg mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-black text-white text-xs font-black rounded-full uppercase">
                    {currentQuestion.category.replace("_", " ")}
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-black text-xs font-black rounded-full uppercase">
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <h2 className="text-3xl font-black mb-8 leading-tight">
                  {currentQuestion.questionText}
                </h2>

                {/* Voice Question */}
                {currentQuestion.questionType === "VOICE_ANSWER" ? (
                  <VoiceRecorder
                    onRecordingComplete={(blob, base64) => {
                      setAudioData(base64);
                      setHasAudioRecording(true);
                    }}
                    disabled={isCurrentAnswerSubmitted}
                  />
                ) : (
                  /* Multiple Choice Options */
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnswer(option)}
                        className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                          selectedAnswer === option
                            ? "bg-black text-white shadow-xl scale-[1.02]"
                            : "bg-white border-2 border-gray-300 hover:border-black hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={`font-black text-lg shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedAnswer === option
                                ? "bg-white text-black"
                                : "bg-black text-white"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-lg leading-relaxed">
                            {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Answer Submission */}
          <div className="mb-8">
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
              className="w-full text-lg"
            >
              {isCurrentAnswerSubmitted
                ? "✓ Answer Submitted"
                : "Submit Answer"}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="lg"
              className="w-full sm:w-auto"
            >
              ← Previous
            </Button>

            <div className="text-center">
              <div className="text-sm font-bold text-gray-500 uppercase mb-1">
                Progress
              </div>
              <div className="text-2xl font-black">
                {testSession.answeredCount} / {testSession.totalQuestions}
              </div>
              <div className="text-xs text-gray-500">Questions Answered</div>
            </div>

            {isLastQuestion ? (
              <Button
                variant="danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                size="lg"
                className="w-full sm:w-auto"
              >
                🏁 Finish Test
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleNext}
                size="lg"
                className="w-full sm:w-auto"
              >
                Next →
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-black mb-6">Question Navigator</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {testSession.questions.map((q, idx) => {
                const isAnswered = testSession.answers.some(
                  (a) => a.questionId === q.id,
                );
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square flex items-center justify-center text-sm font-black rounded-xl transition-all duration-300 ${
                      isCurrent
                        ? "bg-red-600 text-white shadow-lg scale-110"
                        : isAnswered
                          ? "bg-black text-white hover:shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded-lg"></div>
                <span className="text-sm font-medium">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded-lg"></div>
                <span className="text-sm font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded-lg"></div>
                <span className="text-sm font-medium">Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
