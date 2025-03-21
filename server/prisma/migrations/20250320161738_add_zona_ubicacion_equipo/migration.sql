/*
  Warnings:

  - Added the required column `Temp` to the `OT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OT" ADD COLUMN     "Temp" TEXT NOT NULL;
