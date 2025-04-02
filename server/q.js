// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const idArea = 1; // ID del área que deseas asignar
  const username = 'prueba'; // Nombre de usuario que deseas crear
  const password = '1'; // Contraseña en texto plano (no recomendado)

  // Crear un nuevo usuario
  const newUser  = await prisma.user.create({
    data: {
      firstName: 'Nombre', // Cambia esto por el nombre real
      lastName: 'Apellido', // Cambia esto por el apellido real
      areaId: idArea,
      password: password, // Recuerda que no es seguro almacenar contraseñas en texto plano
      username: username,
      isAdmin: false, // Cambia esto según sea necesario
      isDeleted: false // Asegúrate de que el usuario no esté marcado como eliminado
    }
  });

  console.log('Usuario creado:', newUser );
}

// Ejecutar la función principal
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });