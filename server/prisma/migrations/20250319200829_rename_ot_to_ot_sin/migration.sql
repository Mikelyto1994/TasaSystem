/*
  Warnings:

  - You are about to drop the column `name` on the `Ots` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[OTmaximo]` on the table `OT` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ottId` to the `Ots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ots" DROP CONSTRAINT "Ots_name_fkey";

-- DropIndex
DROP INDEX "OT_name_key";

-- AlterTable
ALTER TABLE "Ots" DROP COLUMN "name",
ADD COLUMN     "ottId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OT_OTmaximo_key" ON "OT"("OTmaximo");

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_ottId_fkey" FOREIGN KEY ("ottId") REFERENCES "OT"("OTmaximo") ON DELETE RESTRICT ON UPDATE CASCADE;
