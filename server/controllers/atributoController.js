// controllers/atributoController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo atributo
const createAtributo = async (req, res) => {
  const { componenteId, nombre, valor } = req.body;

  try {
    const atributo = await prisma.atributo.create({
      data: {
        componenteId,
        nombre,
        valor,
      },
    });
    res.status(201).json(atributo);
  } catch (error) {
    console.error("Error al crear atributo:", error);
    res.status(500).json({ message: "Error al crear atributo" });
  }
};

// Obtener todos los atributos
const getAllAtributos = async (req, res) => {
  try {
    const atributos = await prisma.atributo.findMany({
      include: {
        componente: true, // Incluir el componente relacionado
      },
    });
    res.status(200).json(atributos);
  } catch (error) {
    console.error("Error al obtener atributos:", error);
    res.status(500).json({ message: "Error al obtener atributos" });
  }
};

// Obtener un atributo por ID
const getAtributoById = async (req, res) => {
  const { id } = req.params;

  try {
    const atributo = await prisma.atributo.findUnique({
      where: { id: parseInt(id) },
      include: {
        componente: true, // Incluir el componente relacionado
      },
    });

    if (!atributo) {
      return res.status(404).json({ message: "Atributo no encontrado" });
    }

    res.status(200).json(atributo);
  } catch (error) {
    console.error("Error al obtener atributo:", error);
    res.status(500).json({ message: "Error al obtener atributo" });
  }
};

// Actualizar un atributo
const updateAtributo = async (req, res) => {
  const { id } = req.params;
  const { nombre, valor } = req.body;

  try {
    const atributo = await prisma.atributo.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        valor,
      },
    });

    res.status(200).json(atributo);
  } catch (error) {
    console.error("Error al actualizar atributo:", error);
    res.status(500).json({ message: "Error al actualizar atributo" });
  }
};

// Eliminar un atributo
const deleteAtributo = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.atributo.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error al eliminar atributo:", error);
    res.status(500).json({ message: "Error al eliminar atributo" });
  }
};

// Exportar las funciones del controlador
module.exports = {
  createAtributo,
  getAllAtributos,
  getAtributoById,
  updateAtributo,
  deleteAtributo,
};