import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Fetching test session with ID:", id);

    const session = await getServerSession(authOptions);
    console.log("Session user ID:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testSession = await prisma.testSession.findFirst({
      where: {
        id: id,
        userId: session.user.id,
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
        answers: {
          select: {
            questionId: true,
            userAnswer: true,
          },
        },
      },
    });

    console.log("Test session found:", testSession ? "Yes" : "No");

    if (!testSession) {
      return NextResponse.json(
        { error: "Test not found or does not belong to user" },
        { status: 404 }
      );
    }

    return NextResponse.json(testSession);
  } catch (error) {
    console.error("Error fetching test session:", error);
    return NextResponse.json(
      { error: "Failed to fetch test session" },
      { status: 500 }
    );
  }
}
