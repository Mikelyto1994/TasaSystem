-- AlterTable
ALTER TABLE "Atributo" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "AtributoHistorial" (
    "id" SERIAL NOT NULL,
    "atributoId" INTEGER NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "userId" INTEGER NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AtributoHistorial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Atributo" ADD CONSTRAINT "Atributo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtributoHistorial" ADD CONSTRAINT "AtributoHistorial_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtributoHistorial" ADD CONSTRAINT "AtributoHistorial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
