import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Speech-to-Text API endpoint
 * Converts base64 audio data to text using available transcription services
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { audioData } = await req.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 503 },
      );
    }

    const dataUrlMatch = String(audioData).match(
      /^data:(audio\/[\w.+-]+);base64,(.+)$/,
    );

    if (!dataUrlMatch) {
      return NextResponse.json(
        {
          error:
            "Invalid audioData format. Expected data URL like data:audio/webm;base64,...",
        },
        { status: 400 },
      );
    }

    const mimeType = dataUrlMatch[1];
    const base64Payload = dataUrlMatch[2];
    const audioBuffer = Buffer.from(base64Payload, "base64");

    if (!audioBuffer.length) {
      return NextResponse.json(
        { error: "Audio payload is empty" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelCandidates = [
      process.env.GEMINI_MODEL?.trim(),
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
    ].filter((model): model is string => Boolean(model));

    let lastError: unknown;
    let transcribedText = "";
    let selectedModel = "";

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

        transcribedText = (await result.response.text()).trim();
        selectedModel = modelName;
        break;
      } catch (error) {
        lastError = error;
        console.warn(
          `Gemini transcription model failed (${modelName}):`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    if (!selectedModel) {
      throw (
        lastError ??
        new Error("All Gemini transcription model candidates failed")
      );
    }

    return NextResponse.json({
      transcribedText,
      confidence: null,
      provider: "gemini",
      model: selectedModel,
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 },
    );
  }
}
