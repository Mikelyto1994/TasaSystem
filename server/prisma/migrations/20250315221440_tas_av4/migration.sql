-- AddForeignKey
ALTER TABLE "OTConsumible" ADD CONSTRAINT "OTConsumible_otId_fkey" FOREIGN KEY ("otId") REFERENCES "Ots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
