// controllers/otsController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear una nueva OT
const createOT = async (req, res) => {
  const {
    name,
    OT,
    equipoId,
    descripcionEquipo,
    zonaId,
    ubicacionId,
    userId,
    ubicacionSinId,
  } = req.body;

  try {
    const ot = await prisma.ots.create({
      data: {
        name,
        OT,
        equipoId,
        descripcionEquipo,
        zonaId,
        ubicacionId,
        userId,
        ubicacionSinId,
      },
    });
    res.status(201).json(ot);
  } catch (error) {
    console.error("Error al crear OT:", error);
    res.status(500).json({ message: "Error al crear OT" });
  }
};

// Obtener todas las OTs
const getAllOTs = async (req, res) => {
  try {
    const ots = await prisma.ots.findMany({
      include: {
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
    name,
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
        name,
        OT,
        equipoId,
        descripcionEquipo,
        zonaId,
        ubicacionId,
        userId,
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

// Exportar las funciones del controlador
module.exports = {
  createOT,
  getAllOTs,
  getOTById,
  updateOT,
  deleteOT,
};
