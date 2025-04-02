-- CreateTable
CREATE TABLE "_AtributoImage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AtributoImage_AB_unique" ON "_AtributoImage"("A", "B");

-- CreateIndex
CREATE INDEX "_AtributoImage_B_index" ON "_AtributoImage"("B");

-- AddForeignKey
ALTER TABLE "_AtributoImage" ADD CONSTRAINT "_AtributoImage_A_fkey" FOREIGN KEY ("A") REFERENCES "Atributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AtributoImage" ADD CONSTRAINT "_AtributoImage_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
