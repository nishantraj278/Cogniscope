import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateTestAnswers } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CognitiveCategory } from "@prisma/client";

function parseAudioDataUrl(audioData: string): {
  mimeType: string;
  base64Payload: string;
} | null {
  const dataUrlMatch = String(audioData).match(
    /^data:(audio\/[\w.+-]+);base64,(.+)$/,
  );

  if (!dataUrlMatch) {
    return null;
  }

  return {
    mimeType: dataUrlMatch[1],
    base64Payload: dataUrlMatch[2],
  };
}

async function transcribeWithGemini(audioData: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "";
  }

  const parsed = parseAudioDataUrl(audioData);
  if (!parsed) {
    return "";
  }

  const { mimeType, base64Payload } = parsed;
  const audioBuffer = Buffer.from(base64Payload, "base64");
  if (!audioBuffer.length) {
    return "";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelCandidates = [
    process.env.GEMINI_MODEL?.trim(),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
  ].filter((model): model is string => Boolean(model));

  let lastError: unknown;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        {
          text: "Transcribe this audio exactly. Return only the transcript text with no extra commentary.",
        },
        {
          inlineData: {
            mimeType,
            data: base64Payload,
          },
        },
      ]);

      return (await result.response.text()).trim();
    } catch (error) {
      lastError = error;
      console.warn(
        `Gemini transcription model failed (${modelName}):`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.error("Voice transcription failed for all Gemini models", lastError);
  return "";
}

async function evaluateVoiceAnswer(
  questionText: string,
  expectedAnswer: string,
  transcript: string,
): Promise<boolean> {
  if (!transcript.trim()) {
    return false;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const keywords = expectedAnswer
      .split(",")
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean);
    const normalizedTranscript = transcript.toLowerCase();
    return keywords.some((keyword) => normalizedTranscript.includes(keyword));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelCandidates = [
    process.env.GEMINI_MODEL?.trim(),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
  ].filter((model): model is string => Boolean(model));

  const prompt = `You are grading a cognitive voice-test response.

Question: ${questionText}
Expected answer elements: ${expectedAnswer}
Transcript: ${transcript}

Return ONLY valid JSON with this exact shape:
{"isCorrect": true|false}

Mark true when the transcript meaningfully addresses the expected elements, even if wording differs. Mark false when the response is empty, off-topic, or misses key expected elements.`;

  let lastError: unknown;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const raw = (await result.response.text()).trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON object found in voice grading response");
      }

      const parsed = JSON.parse(jsonMatch[0]) as { isCorrect?: boolean };
      return Boolean(parsed.isCorrect);
    } catch (error) {
      lastError = error;
      console.warn(
        `Gemini voice grading model failed (${modelName}):`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.error("Voice answer grading failed for all Gemini models", lastError);

  const keywords = expectedAnswer
    .split(",")
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);
  const normalizedTranscript = transcript.toLowerCase();
  return keywords.some((keyword) => normalizedTranscript.includes(keyword));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 400 },
      );
    }

    // Resolve voice answers before evaluation: transcribe audio and infer correctness.
    for (const question of testSession.questions) {
      if (question.questionType !== "VOICE_ANSWER") {
        continue;
      }

      const answer = testSession.answers.find(
        (a) => a.questionId === question.id,
      );
      if (!answer) {
        continue;
      }

      let updatedTranscribedText = answer.transcribedText?.trim() || "";

      if (!updatedTranscribedText && answer.audioData) {
        updatedTranscribedText = await transcribeWithGemini(answer.audioData);
      }

      let updatedIsCorrect = answer.isCorrect;
      if (updatedIsCorrect === null && updatedTranscribedText) {
        updatedIsCorrect = await evaluateVoiceAnswer(
          question.questionText,
          question.correctAnswer || "",
          updatedTranscribedText,
        );
      }

      const needsUpdate =
        updatedTranscribedText !== (answer.transcribedText || "") ||
        updatedIsCorrect !== answer.isCorrect ||
        (updatedTranscribedText && answer.userAnswer === "[Voice Answer]");

      if (needsUpdate) {
        const updated = await prisma.answer.update({
          where: { id: answer.id },
          data: {
            transcribedText: updatedTranscribedText || null,
            userAnswer: updatedTranscribedText || answer.userAnswer,
            isCorrect: updatedIsCorrect,
          },
        });

        answer.transcribedText = updated.transcribedText;
        answer.userAnswer = updated.userAnswer;
        answer.isCorrect = updated.isCorrect;
      }
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
        userAnswer: answer?.transcribedText || answer?.userAnswer || "",
        isCorrect: answer?.isCorrect === true,
        responseTime: answer?.responseTime ?? undefined,
      };
    });

    // Get evaluation from Gemini
    const evaluation = await evaluateTestAnswers(questions, answers);

    // Calculate duration
    const durationSeconds = Math.floor(
      (new Date().getTime() - testSession.startedAt.getTime()) / 1000,
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
    const scoreCategories: Array<{
      category: CognitiveCategory;
      score: number;
    }> = [
      {
        category: CognitiveCategory.MEMORY_RECALL,
        score: evaluation.categoryScores.memoryScore,
      },
      {
        category: CognitiveCategory.ATTENTION,
        score: evaluation.categoryScores.attentionScore,
      },
      {
        category: CognitiveCategory.EXECUTIVE_FUNCTION,
        score: evaluation.categoryScores.executiveFunctionScore,
      },
      {
        category: CognitiveCategory.LANGUAGE_COMPREHENSION,
        score: evaluation.categoryScores.languageScore,
      },
      {
        category: CognitiveCategory.VISUAL_SPATIAL,
        score: evaluation.categoryScores.visualSpatialScore,
      },
    ];

    await Promise.all(
      scoreCategories.map((sc) =>
        prisma.cognitiveScore.create({
          data: {
            testSessionId: id,
            category: sc.category,
            score: sc.score,
            maxScore: 100,
          },
        }),
      ),
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 },
    );
  }
}
