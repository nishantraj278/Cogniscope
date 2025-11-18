import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
  responseTime: z.number().optional(),
});

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

    const body = await req.json();
    const { questionId, userAnswer, responseTime } = answerSchema.parse(body);

    // Verify test session belongs to user
    const testSession = await prisma.testSession.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!testSession) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Get the question
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        testSessionId: id,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect =
      userAnswer.trim().toLowerCase() === question.correctAnswer?.toLowerCase();

    // Create or update answer
    const answer = await prisma.answer.upsert({
      where: {
        questionId: questionId,
      },
      create: {
        testSessionId: id,
        questionId,
        userAnswer,
        isCorrect,
        responseTime,
      },
      update: {
        userAnswer,
        isCorrect,
        responseTime,
      },
    });

    // Update test session answered count
    const answeredCount = await prisma.answer.count({
      where: {
        testSessionId: id,
      },
    });

    await prisma.testSession.update({
      where: { id: id },
      data: { answeredCount },
    });

    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
