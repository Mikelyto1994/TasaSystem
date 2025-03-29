// controllers/prisma.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Manejo de cierre de conexiones
process.on('SIGINT', async () => {
  console.log("Cerrando conexiones a la base de datos...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log("Cerrando conexiones a la base de datos...");
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;