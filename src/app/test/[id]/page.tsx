"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
        (a) => a.questionId === testSession.questions[currentIndex].id
      );
      setSelectedAnswer(existingAnswer?.userAnswer || "");
      setIsCurrentAnswerSubmitted(!!existingAnswer);
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
          }`
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
        }. Redirecting to dashboard.`
      );
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = async () => {
    if (!testSession || !selectedAnswer) return;

    const currentQuestion = testSession.questions[currentIndex];
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
          userAnswer: selectedAnswer,
          responseTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save answer");
      }

      // Update local state
      const updatedAnswers = testSession.answers.filter(
        (a) => a.questionId !== currentQuestion.id
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
        `You have ${unanswered} unanswered questions. Submit anyway?`
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Cognitive Assessment</h1>
            <div className="text-sm font-medium">
              Question {currentIndex + 1} of {testSession.totalQuestions}
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="elevated" className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-black text-white text-xs font-medium">
                    {currentQuestion.category.replace("_", " ")}
                  </span>
                  <span className="px-3 py-1 border-2 border-black text-xs font-medium">
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <CardTitle className="text-xl">
                  {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full text-left p-4 border-2 transition-all ${
                        selectedAnswer === option
                          ? "border-black bg-black text-white"
                          : "border-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Answer Submission */}
        <div className="mb-6">
          <Button
            variant={isCurrentAnswerSubmitted ? "secondary" : "primary"}
            onClick={saveAnswer}
            disabled={
              !selectedAnswer || isSavingAnswer || isCurrentAnswerSubmitted
            }
            isLoading={isSavingAnswer}
            loadingText="Submitting..."
            className="w-full"
          >
            {isCurrentAnswerSubmitted ? "Submitted ✓" : "Submit Answer"}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Previous
          </Button>

          <div className="text-sm text-gray-600">
            {testSession.answeredCount} / {testSession.totalQuestions} answered
          </div>

          {isLastQuestion ? (
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Finish Test
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleNext}>
              Next →
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card variant="bordered" className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {testSession.questions.map((q, idx) => {
                const isAnswered = testSession.answers.some(
                  (a) => a.questionId === q.id
                );
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square flex items-center justify-center text-sm font-medium border-2 transition-all ${
                      isCurrent
                        ? "border-red-600 bg-red-600 text-white"
                        : isAnswered
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white hover:border-black"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
