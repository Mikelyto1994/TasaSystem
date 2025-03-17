// controllers/otConsumibleController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo OTConsumible
const createOTConsumible = async (req, res) => {
  const { consumibleId, nombreConsumible, unidadMedida, cantidad, otId, userId, imageUrl, estado, reservaSap, comentarios } = req.body;

  try {
    let otConsumible;

    if (consumibleId) {
      // Si hay un consumibleId, se crea el OTConsumible asociado
      otConsumible = await prisma.oTConsumible.create({
        data: {
          consumibleId,
          otId,
          userId,
          imageUrl,
          estado,
          reservaSap,
          comentarios,
          cantidad,
        },
      });
    } else {
      // Si no hay consumibleId, se crea un nuevo consumible y se asocia
      const nuevoConsumible = await prisma.consumible.create({
        data: {
          name: nombreConsumible,
          unidadMedida,
          codMaximo: '', // Puedes establecer un valor predeterminado o dejarlo vacío
          nombreMaximo: nombreConsumible, // O cualquier otro valor que desees
        },
      });

      // Luego, se crea el OTConsumible asociado al nuevo consumible
      otConsumible = await prisma.oTConsumible.create({
        data: {
          consumibleId: nuevoConsumible.id, // Asocia el nuevo consumible
          otId,
          userId,
          imageUrl,
          estado,
          reservaSap,
          comentarios,
          cantidad,
        },
      });
    }

    res.status(201).json(otConsumible);
  } catch (error) {
    console.error("Error al crear OTConsumible:", error);
    res.status(500).json({ message: "Error al crear OTConsumible" });
  }
};

// Obtener todos los OTConsumibles
const getAllOTConsumibles = async (req, res) => {
  try {
    const otConsumibles = await prisma.oTConsumible.findMany({
      include: {
        consumible: true, // Incluir el consumible relacionado
        user: true, // Incluir el usuario relacionado
        ot: true, // Incluir la OT relacionada
      },
    });
    res.json(otConsumibles);
  } catch (error) {
    console.error("Error al obtener OTConsumibles:", error);
    res.status(500).json({ message: "Error al obtener OTConsumibles" });
  }
};

// Obtener un OTConsumible por ID
const getOTConsumibleById = async (req, res) => {
  const { id } = req.params;

  try {
    const otConsumible = await prisma.oTConsumible.findUnique({
      where: { id: parseInt(id) },
      include: {
        consumible: true, // Incluir el consumible relacionado
        user: true, // Incluir el usuario relacionado
        ot: true, // Incluir la OT relacionada
      },
    });

    if (!otConsumible) {
      return res.status(404).json({ message: "OTConsumible no encontrado" });
    }

    res.json(otConsumible);
  } catch (error) {
    console.error("Error al obtener OTConsumible:", error);
    res.status(500).json({ message: "Error al obtener OTConsumible" });
  }
};

// Actualizar un OTConsumible
const updateOTConsumible = async (req, res) => {
  const { id } = req.params;
  const { consumibleId, nombreConsumible, unidadMedida, cantidad, otId, userId, imageUrl, estado, reservaSap, comentarios } = req.body;

  try {
    const otConsumible = await prisma.oTConsumible.update({
      where: { id: parseInt(id) },
      data: {
        consumibleId,
        otId,
        userId,
        imageUrl,
        estado,
        reservaSap,
        comentarios,
        cantidad,
      },
    });

    res.json(otConsumible);
  } catch (error) {
    console.error("Error al actualizar OTConsumible:", error);
    res.status(500).json({ message: "Error al actualizar OTConsumible" });
  }
};

// Eliminar un OTConsumible
const deleteOTConsumible = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.oTConsumible.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error al eliminar OTConsumible:", error);
    res.status(500).json({ message: "Error al eliminar OTConsumible" });
  }
};

// Exportar las funciones
module.exports = {
  createOTConsumible,
  getAllOTConsumibles,
  getOTConsumibleById,
  updateOTConsumible,
  deleteOTConsumible,
};