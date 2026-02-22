-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('MCQ', 'VOICE');

-- AlterTable
ALTER TABLE "test_sessions" ADD COLUMN     "testType" "TestType" NOT NULL DEFAULT 'MCQ';

-- CreateIndex
CREATE INDEX "test_sessions_testType_idx" ON "test_sessions"("testType");
