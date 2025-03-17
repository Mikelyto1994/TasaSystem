const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Obtener todos los usuarios
  const users = await prisma.user.findMany();
  console.log('Usuarios:', users);

  // Obtener todas las áreas
  const areas = await prisma.area.findMany();
  console.log('Áreas:', areas);

  // Obtener todas las OTs
  const ots = await prisma.ots.findMany();
  console.log('OTs:', ots);

  // Obtener todos los consumibles
  const consumibles = await prisma.consumible.findMany();
  console.log('Consumibles:', consumibles);

  // Obtener todas las zonas
  const zonas = await prisma.zona.findMany();
  console.log('Zonas:', zonas);

  // Obtener todas las ubicaciones
  const ubicaciones = await prisma.ubicacion.findMany();
  console.log('Ubicaciones:', ubicaciones);

  // Obtener todos los componentes
  const componentes = await prisma.componente.findMany();
  console.log('Componentes:', componentes);

  // Obtener todos los atributos
  const atributos = await prisma.atributo.findMany();
  console.log('Atributos:', atributos);

  // Obtener todos los repuestos
  const repuestos = await prisma.repuesto.findMany();
  console.log('Repuestos:', repuestos);

  // Obtener todos los equipos
  const equipos = await prisma.equipo.findMany();
  console.log('Equipos:', equipos);

  // Obtener todas las imágenes
  const images = await prisma.image.findMany();
  console.log('Imágenes:', images);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });