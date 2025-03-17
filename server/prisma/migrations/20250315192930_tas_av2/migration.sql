/*
  Warnings:

  - Added the required column `zonaId` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "ubicacionSinId" TEXT;

-- AlterTable
ALTER TABLE "Ots" ADD COLUMN     "ubicacionSinId" TEXT;

-- AlterTable
ALTER TABLE "Ubicacion" ADD COLUMN     "zonaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
