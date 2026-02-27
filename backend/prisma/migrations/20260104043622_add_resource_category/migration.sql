-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL');

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "category" "ResourceCategory" NOT NULL DEFAULT 'ACADEMIC',
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");
