const prisma = require("./prisma");

// Crear un nuevo consumible
const createConsumible = async (req, res) => {
  const { name, unidadMedida, codMaximo, nombreMaximo } = req.body;

  try {
    const consumible = await prisma.consumible.create({
      data: {
        name,
        unidadMedida,
        codMaximo,
        nombreMaximo,
      },
    });
    res.status(201).json(consumible);
  } catch (error) {
    console.error("Error al crear consumible:", error);
    res.status(500).json({ message: "Error al crear consumible" });
  }
};

// Obtener todos los consumibles
const getAllConsumibles = async (req, res) => {
  try {
    const consumibles = await prisma.consumible.findMany();
    res.status(200).json(consumibles);
  } catch (error) {
    console.error("Error al obtener consumibles:", error);
    res.status(500).json({ message: "Error al obtener consumibles" });
  }
};

// Obtener un consumible por ID
const getConsumibleById = async (req, res) => {
  const { id } = req.params;

  try {
    const consumible = await prisma.consumible.findUnique({
      where: { id: parseInt(id) },
    });

    if (!consumible) {
      return res.status(404).json({ message: "Consumible no encontrado" });
    }

    res.status(200).json(consumible);
  } catch (error) {
    console.error("Error al obtener consumible:", error);
    res.status(500).json({ message: "Error al obtener consumible" });
  }
};

// Actualizar un consumible
const updateConsumible = async (req, res) => {
  const { id } = req.params;
  const { name, unidadMedida, codMaximo, nombreMaximo } = req.body;

  try {
    const consumible = await prisma.consumible.update({
      where: { id: parseInt(id) },
      data: {
        name,
        unidadMedida,
        codMaximo,
        nombreMaximo,
      },
    });

    res.status(200).json(consumible);
  } catch (error) {
    console.error("Error al actualizar consumible:", error);
    res.status(500).json({ message: "Error al actualizar consumible" });
  }
};

// Eliminar un consumible (solo si el usuario es admin)
const deleteConsumible = async (req, res) => {
  const { id } = req.params;
  const user = req.user; // Asumiendo que el usuario está en req.user después de la autenticación

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "No tienes permiso para eliminar consumibles" });
  }

  try {
    await prisma.consumible.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error al eliminar consumible:", error);
    res.status(500).json({ message: "Error al eliminar consumible" });
  }
};

module.exports = {
  createConsumible,
  getAllConsumibles,
  getConsumibleById,
  updateConsumible,
  deleteConsumible,
};