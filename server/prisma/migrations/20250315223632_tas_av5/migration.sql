-- AddForeignKey
ALTER TABLE "OTConsumible" ADD CONSTRAINT "OTConsumible_consumibleId_fkey" FOREIGN KEY ("consumibleId") REFERENCES "Consumible"("id") ON DELETE SET NULL ON UPDATE CASCADE;
