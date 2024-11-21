/*
  Warnings:

  - Added the required column `periodoFin` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodoInicio` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "periodoFin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodoInicio" TIMESTAMP(3) NOT NULL;
