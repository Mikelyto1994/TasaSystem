/*
  Warnings:

  - Added the required column `equipoId` to the `OT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ubicacionId` to the `OT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zonaId` to the `OT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OT" ADD COLUMN     "equipoId" INTEGER NOT NULL,
ADD COLUMN     "ubicacionId" INTEGER NOT NULL,
ADD COLUMN     "zonaId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OT" ADD CONSTRAINT "OT_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OT" ADD CONSTRAINT "OT_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OT" ADD CONSTRAINT "OT_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
