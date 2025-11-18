import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateTestAnswers } from "@/lib/gemini";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get test session with questions and answers
    const testSession = await prisma.testSession.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        answers: true,
      },
    });

    if (!testSession) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (testSession.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Test already completed" },
        { status: 400 }
      );
    }

    // Prepare data for evaluation
    const questions = testSession.questions.map((q) => ({
      questionText: q.questionText,
      category: q.category,
      difficulty: q.difficulty,
      correctAnswer: q.correctAnswer || "",
    }));

    const answers = testSession.questions.map((q) => {
      const answer = testSession.answers.find((a) => a.questionId === q.id);
      return {
        questionText: q.questionText,
        userAnswer: answer?.userAnswer || "",
        isCorrect: answer?.isCorrect || false,
        responseTime: answer?.responseTime,
      };
    });

    // Get evaluation from Gemini
    const evaluation = await evaluateTestAnswers(questions, answers);

    // Calculate duration
    const durationSeconds = Math.floor(
      (new Date().getTime() - testSession.startedAt.getTime()) / 1000
    );

    // Update test session
    await prisma.testSession.update({
      where: { id: id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        durationSeconds,
      },
    });

    // Create report
    const report = await prisma.report.create({
      data: {
        userId: session.user.id,
        testSessionId: id,
        overallScore: evaluation.overallScore,
        riskLevel: evaluation.riskLevel,
        cognitiveAge: evaluation.cognitiveAge,
        memoryScore: evaluation.categoryScores.memoryScore,
        attentionScore: evaluation.categoryScores.attentionScore,
        executiveFunctionScore:
          evaluation.categoryScores.executiveFunctionScore,
        languageScore: evaluation.categoryScores.languageScore,
        visualSpatialScore: evaluation.categoryScores.visualSpatialScore,
        summary: evaluation.summary,
        strengths: evaluation.strengths,
        concernAreas: evaluation.concernAreas,
        recommendations: evaluation.recommendations,
        clinicalIndicators: evaluation.clinicalIndicators,
        preventiveSteps: evaluation.preventiveSteps,
      },
    });

    // Create cognitive scores
    const scoreCategories = [
      {
        category: "MEMORY_RECALL",
        score: evaluation.categoryScores.memoryScore,
      },
      {
        category: "ATTENTION",
        score: evaluation.categoryScores.attentionScore,
      },
      {
        category: "EXECUTIVE_FUNCTION",
        score: evaluation.categoryScores.executiveFunctionScore,
      },
      {
        category: "LANGUAGE_COMPREHENSION",
        score: evaluation.categoryScores.languageScore,
      },
      {
        category: "VISUAL_SPATIAL",
        score: evaluation.categoryScores.visualSpatialScore,
      },
    ];

    await Promise.all(
      scoreCategories.map((sc) =>
        prisma.cognitiveScore.create({
          data: {
            testSessionId: id,
            category: sc.category as any,
            score: sc.score,
            maxScore: 100,
          },
        })
      )
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}
