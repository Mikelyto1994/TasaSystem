/*
  Warnings:

  - Made the column `OT` on table `Ots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ots" ALTER COLUMN "OT" SET NOT NULL,
ALTER COLUMN "OT" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "OT" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "OTmaximo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "OT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OT_name_key" ON "OT"("name");

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_name_fkey" FOREIGN KEY ("name") REFERENCES "OT"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
