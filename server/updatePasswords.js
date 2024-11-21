const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const updatePasswords = async () => {
  try {
    // Recupera todos los usuarios que tienen contraseñas en texto plano
    const users = await prisma.user.findMany({
      where: {
        password: {
          // Asegúrate de que las contraseñas estén en texto plano
          not: undefined,
        },
      },
    });

    // Itera sobre todos los usuarios para actualizar sus contraseñas
    for (const user of users) {
      // Hashea la contraseña
      const hashedPassword = bcrypt.hashSync(user.password, 10);

      // Actualiza la contraseña en la base de datos
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`Contraseña actualizada para el usuario: ${user.username}`);
    }

    console.log("Actualización de contraseñas completada");
  } catch (error) {
    console.error("Error al actualizar las contraseñas:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Ejecuta la función
updatePasswords();
