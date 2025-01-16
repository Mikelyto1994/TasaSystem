/*
  Warnings:

  - Added the required column `categoriaId` to the `Movimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "categoriaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_name_key" ON "Categoria"("name");

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
