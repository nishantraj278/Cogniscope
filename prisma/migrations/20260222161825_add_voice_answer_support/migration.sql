-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'VOICE_ANSWER';

-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "audioData" TEXT,
ADD COLUMN     "transcribedText" TEXT;
