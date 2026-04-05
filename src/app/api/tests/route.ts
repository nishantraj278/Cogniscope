import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCognitiveTest } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/tests - Creating new test session");
    const session = await getServerSession(authOptions);
    console.log(
      "Session:",
      session?.user?.id ? "Authenticated" : "Not authenticated",
    );

    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { numberOfQuestions = 20, testType = "MCQ" } = await req.json();
    const effectiveQuestionCount =
      testType === "VOICE" ? 7 : Number(numberOfQuestions) || 20;

    console.log("Requested number of questions:", numberOfQuestions);
    console.log("Test type:", testType);
    console.log("Effective question count:", effectiveQuestionCount);

    // Generate questions using Gemini
    console.log("Generating questions with Gemini...");
    let generatedQuestions;
    try {
      generatedQuestions = await generateCognitiveTest(
        effectiveQuestionCount,
        testType,
      );
      console.log("Generated questions:", generatedQuestions.length);
    } catch (geminiError) {
      console.error("Gemini API Error:", geminiError);
      console.error(
        "Gemini Error Message:",
        geminiError instanceof Error ? geminiError.message : "Unknown",
      );
      throw geminiError;
    }

    // Create test session
    console.log("Creating test session in database...");
    const testSession = await prisma.testSession.create({
      data: {
        userId: session.user.id,
        testType: testType,
        totalQuestions: generatedQuestions.length,
        status: "IN_PROGRESS",
        questions: {
          create: generatedQuestions.map((q, index) => ({
            questionType: q.questionType as any,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            category: q.category as any,
            difficulty: q.difficulty as any,
            orderIndex: index,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            questionType: true,
            questionText: true,
            options: true,
            orderIndex: true,
            category: true,
            difficulty: true,
          },
        },
      },
    });

    console.log("Test session created successfully:", testSession.id);
    console.log("Test includes", testSession.questions.length, "questions");
    return NextResponse.json(testSession, { status: 201 });
  } catch (error) {
    console.error("Error creating test session:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Failed to create test session" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testSessions = await prisma.testSession.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        report: {
          select: {
            overallScore: true,
            riskLevel: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json(testSessions);
  } catch (error) {
    console.error("Error fetching test sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch test sessions" },
      { status: 500 },
    );
  }
}
