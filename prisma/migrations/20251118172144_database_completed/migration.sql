-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'SEQUENCE', 'PATTERN_RECOGNITION');

-- CreateEnum
CREATE TYPE "CognitiveCategory" AS ENUM ('MEMORY_RECALL', 'ATTENTION', 'EXECUTIVE_FUNCTION', 'LANGUAGE_COMPREHENSION', 'VISUAL_SPATIAL', 'PROCESSING_SPEED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "category" "CognitiveCategory" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "responseTime" INTEGER,
    "confidence" DOUBLE PRECISION,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "cognitiveAge" INTEGER,
    "memoryScore" DOUBLE PRECISION NOT NULL,
    "attentionScore" DOUBLE PRECISION NOT NULL,
    "executiveFunctionScore" DOUBLE PRECISION NOT NULL,
    "languageScore" DOUBLE PRECISION NOT NULL,
    "visualSpatialScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "concernAreas" TEXT[],
    "recommendations" TEXT[],
    "clinicalIndicators" TEXT[],
    "preventiveSteps" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cognitive_scores" (
    "id" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "category" "CognitiveCategory" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "averageResponseTime" DOUBLE PRECISION,
    "consistency" DOUBLE PRECISION,

    CONSTRAINT "cognitive_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "test_sessions_userId_idx" ON "test_sessions"("userId");

-- CreateIndex
CREATE INDEX "test_sessions_status_idx" ON "test_sessions"("status");

-- CreateIndex
CREATE INDEX "questions_testSessionId_idx" ON "questions"("testSessionId");

-- CreateIndex
CREATE INDEX "questions_category_idx" ON "questions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "answers_questionId_key" ON "answers"("questionId");

-- CreateIndex
CREATE INDEX "answers_testSessionId_idx" ON "answers"("testSessionId");

-- CreateIndex
CREATE INDEX "answers_questionId_idx" ON "answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_testSessionId_key" ON "reports"("testSessionId");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_riskLevel_idx" ON "reports"("riskLevel");

-- CreateIndex
CREATE INDEX "cognitive_scores_testSessionId_idx" ON "cognitive_scores"("testSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "cognitive_scores_testSessionId_category_key" ON "cognitive_scores"("testSessionId", "category");

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cognitive_scores" ADD CONSTRAINT "cognitive_scores_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
