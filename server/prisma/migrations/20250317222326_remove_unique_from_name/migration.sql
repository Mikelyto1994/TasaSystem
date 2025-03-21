-- DropForeignKey
ALTER TABLE "Ots" DROP CONSTRAINT "Ots_ubicacionId_fkey";

-- DropIndex
DROP INDEX "Ots_name_key";

-- AlterTable
ALTER TABLE "Ots" ALTER COLUMN "ubicacionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
