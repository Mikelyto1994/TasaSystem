-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ots" (
    "id" SERIAL NOT NULL,
    "OT" TEXT,
    "equipoId" INTEGER,
    "descripcionEquipo" TEXT,
    "zonaId" INTEGER NOT NULL,
    "ubicacionId" INTEGER,
    "userId" INTEGER NOT NULL,
    "ubicacionSinId" TEXT,
    "ottId" TEXT,

    CONSTRAINT "Ots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTConsumible" (
    "id" SERIAL NOT NULL,
    "consumibleId" INTEGER,
    "nombreConsumible" TEXT,
    "unidadMedida" TEXT,
    "cantidad" DOUBLE PRECISION,
    "otId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "comentarios" TEXT,
    "estado" TEXT,
    "reservaSap" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTConsumible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consumible" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "codMaximo" TEXT NOT NULL,
    "nombreMaximo" TEXT NOT NULL,

    CONSTRAINT "Consumible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zona" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nombreMaximo" TEXT NOT NULL,

    CONSTRAINT "Zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nombreMaximo" TEXT NOT NULL,
    "zonaId" INTEGER NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Componente" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "parteEquipo" TEXT NOT NULL,
    "imageUrl" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atributo" (
    "id" SERIAL NOT NULL,
    "componenteId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" TEXT,

    CONSTRAINT "Atributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repuesto" (
    "id" SERIAL NOT NULL,
    "componenteId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imageUrl" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nombreMaximo" TEXT NOT NULL,
    "zonaId" INTEGER NOT NULL,
    "ubicacionId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "ubicacionSinId" TEXT,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTbasico" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "Temp" TEXT NOT NULL,
    "OTmaximo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "zonaId" INTEGER,
    "ubicacionId" INTEGER,
    "equipoId" INTEGER,

    CONSTRAINT "OTbasico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComponenteImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EquipoImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ConsumibleImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RepuestoImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OTbasico_OTmaximo_key" ON "OTbasico"("OTmaximo");

-- CreateIndex
CREATE UNIQUE INDEX "_ComponenteImage_AB_unique" ON "_ComponenteImage"("A", "B");

-- CreateIndex
CREATE INDEX "_ComponenteImage_B_index" ON "_ComponenteImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EquipoImage_AB_unique" ON "_EquipoImage"("A", "B");

-- CreateIndex
CREATE INDEX "_EquipoImage_B_index" ON "_EquipoImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConsumibleImage_AB_unique" ON "_ConsumibleImage"("A", "B");

-- CreateIndex
CREATE INDEX "_ConsumibleImage_B_index" ON "_ConsumibleImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RepuestoImage_AB_unique" ON "_RepuestoImage"("A", "B");

-- CreateIndex
CREATE INDEX "_RepuestoImage_B_index" ON "_RepuestoImage"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_ottId_fkey" FOREIGN KEY ("ottId") REFERENCES "OTbasico"("OTmaximo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ots" ADD CONSTRAINT "Ots_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTConsumible" ADD CONSTRAINT "OTConsumible_consumibleId_fkey" FOREIGN KEY ("consumibleId") REFERENCES "Consumible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTConsumible" ADD CONSTRAINT "OTConsumible_otId_fkey" FOREIGN KEY ("otId") REFERENCES "Ots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTConsumible" ADD CONSTRAINT "OTConsumible_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Componente" ADD CONSTRAINT "Componente_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Componente" ADD CONSTRAINT "Componente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atributo" ADD CONSTRAINT "Atributo_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTbasico" ADD CONSTRAINT "OTbasico_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTbasico" ADD CONSTRAINT "OTbasico_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTbasico" ADD CONSTRAINT "OTbasico_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "Zona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComponenteImage" ADD CONSTRAINT "_ComponenteImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComponenteImage" ADD CONSTRAINT "_ComponenteImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipoImage" ADD CONSTRAINT "_EquipoImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipoImage" ADD CONSTRAINT "_EquipoImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsumibleImage" ADD CONSTRAINT "_ConsumibleImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsumibleImage" ADD CONSTRAINT "_ConsumibleImage_B_fkey" FOREIGN KEY ("B") REFERENCES "OTConsumible"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepuestoImage" ADD CONSTRAINT "_RepuestoImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RepuestoImage" ADD CONSTRAINT "_RepuestoImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Repuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
