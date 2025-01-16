// No es necesario importar Prisma aquí

// Definir el offset de Lima (UTC-5)
const limaOffset = -5;

// Middleware para ajustar las fechas a la zona horaria de Lima (UTC-5)
const prismaMiddleware = async (params, next) => {
  // Solo aplicar el ajuste de fecha a los movimientos
  if (params.model === "Movimiento" && params.action === "create") {
    // Obtener la fecha actual en UTC
    const nowUtc = new Date();

    // Ajustar la fecha a la zona horaria de Lima (UTC-5)
    const limaDate = new Date(nowUtc.getTime() + limaOffset * 60 * 60 * 1000);

    // Asegurarse de que la fecha de creación y la fecha del movimiento se ajusten
    if (!params.args.data.fecha) {
      params.args.data.fecha = limaDate; // Ajustar la fecha si no se especifica
    }

    if (!params.args.data.FechaCreacion) {
      params.args.data.FechaCreacion = limaDate; // Ajustar la fecha de creación si no se especifica
    }
  }

  // Continuar con la ejecución de la acción de Prisma
  return next(params);
};

// Exportar el middleware usando module.exports
module.exports = { prismaMiddleware };
