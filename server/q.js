const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTestOt = async () => {
  try {
    const testOt = await prisma.ots.create({
      data: {
        ottId: "646878", // Nuevo ottId
        OT: "", // Campo OT vacío
        equipoId: 734, // Nuevo equipoId
        descripcionEquipo: "", // Campo descripción vacío
        zonaId: 10, // Nuevo zonaId
        ubicacionId: null, // Ubicación ID nulo
        ubicacionSinId: "asdsda", // Nueva ubicación sin ID
        userId: 2, // Asegúrate de que este ID exista en tu tabla de usuarios
      },
    });
    console.log("Registro de prueba creado:", testOt);
  } catch (error) {
    console.error("Error al crear el registro de prueba:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Llamar a la función
createTestOt();