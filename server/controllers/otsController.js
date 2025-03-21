const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear una nueva OT
const createOT = async (req, res) => {
  const {
    ottId,
    OT,
    equipoId,
    descripcionEquipo,
    zonaId,
    ubicacionId,
    userId,
    ubicacionSinId,
  } = req.body;

  try {
    // Validar que los campos requeridos no sean nulos
    if (!ottId || !zonaId || !userId) {
      return res.status(400).json({ message: "Faltan campos requeridos." });
    }

    // Validar que userId, zonaId y equipoId sean números válidos
    if (isNaN(userId) || isNaN(zonaId) || (equipoId && isNaN(equipoId))) {
      return res
        .status(400)
        .json({ message: "ID de usuario, zona o equipo no válidos." });
    }

    // Crear la nueva OT
    const ot = await prisma.ots.create({
      data: {
        ottId: String(ottId), // Asegúrate de que ottId sea una cadena
        OT: OT || null, // Si OT no se proporciona, se establece como null
        equipoId: equipoId ? parseInt(equipoId, 10) : null, // Asegúrate de que sea un número o nulo
        descripcionEquipo,
        zonaId: parseInt(zonaId, 10), // Asegúrate de que sea un número
        ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null, // Asegúrate de que sea un número o nulo
        userId: parseInt(userId, 10), // Asegúrate de que userId sea un número
        ubicacionSinId,
        user: {
          connect: { id: parseInt(userId, 10) }, // Conectar el usuario existente
        },
        zona: {
          connect: { id: parseInt(zonaId, 10) }, // Conectar la zona existente
        },
      },
    });

    // Respuesta exitosa
    res.status(201).json(ot);
  } catch (error) {
    console.error("Error al crear OT:", error);

    // Manejo de errores más detallado
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `El ottId '${ottId}' ya está en uso.` });
    }

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "No se encontró el registro relacionado." });
    }

    // Respuesta genérica para otros errores
    res
      .status(500)
      .json({ message: "Error al crear OT", error: error.message });
  }
};

// Obtener todas las OTs
const getAllOTs = async (req, res) => {
  try {
    const ots = await prisma.ots.findMany({
      include: {
        ot: true, // Incluir información de la OT relacionada
        user: true, // Incluir información del usuario
        equipo: true, // Incluir información del equipo
        ubicacion: true, // Incluir información de la ubicación
        zona: true, // Incluir información de la zona
      },
    });
    res.status(200).json(ots);
  } catch (error) {
    console.error("Error al obtener OTs:", error);
    res.status(500).json({ message: "Error al obtener OTs" });
  }
};

// Obtener una OT por ID
const getOTById = async (req, res) => {
  const { id } = req.params;

  try {
    const ot = await prisma.ots.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        equipo: true,
        ubicacion: true,
        zona: true,
      },
    });

    if (!ot) {
      return res.status(404).json({ message: "OT no encontrada" });
    }

    res.status(200).json(ot);
  } catch (error) {
    console.error("Error al obtener OT:", error);
    res.status(500).json({ message: "Error al obtener OT" });
  }
};

// Actualizar una OT
const updateOT = async (req, res) => {
  const { id } = req.params;
  const {
    ottId,
    OT,
    equipoId,
    descripcionEquipo,
    zonaId,
    ubicacionId,
    userId,
    ubicacionSinId,
  } = req.body;

  try {
    const ot = await prisma.ots.update({
      where: { id: parseInt(id) },
      data: {
        ottId,
        OT,
        equipoId: equipoId ? parseInt(equipoId, 10) : null,
        descripcionEquipo,
        zonaId: parseInt(zonaId, 10), // Asegúrate de que sea un número
        ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null,
        userId: parseInt(userId, 10),
        ubicacionSinId,
      },
    });

    res.status(200).json(ot);
  } catch (error) {
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ message: "Error al actualizar OT" });
  }
};

// Eliminar una OT
const deleteOT = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.ots.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error al eliminar OT:", error);
    res.status(500).json({ message: "Error al eliminar OT" });
  }
};

const searchOts = async (req, res) => {
  const { startDate, endDate, zona, ubicacion, equipo } = req.query;

  // Validar parámetros de entrada
  if (startDate && isNaN(new Date(startDate))) {
    return res.status(400).json({ error: "La fecha de inicio no es válida." });
  }
  if (endDate && isNaN(new Date(endDate))) {
    return res.status(400).json({ error: "La fecha de fin no es válida." });
  }
  if (zona && isNaN(Number(zona))) {
    return res.status(400).json({ error: "El ID de zona no es válido." });
  }
  if (ubicacion && isNaN(Number(ubicacion))) {
    return res.status(400).json({ error: "El ID de ubicación no es válido." });
  }
  if (equipo && isNaN(Number(equipo))) {
    return res.status(400).json({ error: "El ID de equipo no es válido." });
  }

  // Construir condiciones de búsqueda
  const conditions = {};

  if (startDate) {
    conditions.createdAt = { gte: new Date(startDate) };
  }
  if (endDate) {
    conditions.createdAt = { ...conditions.createdAt, lte: new Date(endDate) };
  }
  if (zona) {
    conditions.zonaId = Number(zona);
  }
  if (ubicacion) {
    conditions.ubicacionId = Number(ubicacion);
  }
  if (equipo) {
    conditions.equipoId = Number(equipo);
  }

  try {
    const ots = await prisma.ots.findMany({
      where: conditions,
      include: {
        user: true,
        equipo: true,
        ubicacion: true,
        zona: true,
      },
    });

    // Si no se encuentran órdenes de trabajo
    if (ots.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron órdenes de trabajo." });
    }

    res.json(ots);
  } catch (error) {
    console.error("Error al buscar órdenes de trabajo:", error);
    res.status(500).json({
      error: "Error al buscar órdenes de trabajo",
      details: error.message,
      stack: error.stack, // Agregar el stack trace para más detalles
    });
  }
};

// Exportar las funciones del controlador
module.exports = {
  createOT,
  getAllOTs,
  getOTById,
  updateOT,
  deleteOT,
  searchOts,
};
