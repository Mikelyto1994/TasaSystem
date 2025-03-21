-- DropForeignKey
ALTER TABLE "OT" DROP CONSTRAINT "OT_equipoId_fkey";

-- DropForeignKey
ALTER TABLE "OT" DROP CONSTRAINT "OT_ubicacionId_fkey";

-- AlterTable
ALTER TABLE "OT" ALTER COLUMN "equipoId" DROP NOT NULL,
ALTER COLUMN "ubicacionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OT" ADD CONSTRAINT "OT_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OT" ADD CONSTRAINT "OT_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
