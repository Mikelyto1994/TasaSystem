const prisma = require("./prisma");

// Crear un nuevo componente
const createComponente = async (req, res) => {
  const { equipoId, parteEquipo, imageUrl, userId } = req.body;

  try {
    const componente = await prisma.componente.create({
      data: {
        equipoId,
        parteEquipo,
        imageUrl,
        userId,
      },
    });
    res.status(201).json(componente);
  } catch (error) {
    console.error("Error al crear componente:", error);
    res.status(500).json({ message: "Error al crear componente" });
  }
};

// Obtener todos los componentes
const getAllComponentes = async (req, res) => {
  try {
    const componentes = await prisma.componente.findMany({
      include: {
        equipo: true, // Incluir el equipo relacionado
        atributos: true, // Incluir los atributos relacionados
      },
    });
    res.status(200).json(componentes);
  } catch (error) {
    console.error("Error al obtener componentes:", error);
    res.status(500).json({ message: "Error al obtener componentes" });
  }
};

// Obtener un componente por ID
const getComponenteById = async (req, res) => {
  const { id } = req.params;

  try {
    const componente = await prisma.componente.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipo: true, // Incluir el equipo relacionado
        atributos: true, // Incluir los atributos relacionados
      },
    });

    if (!componente) {
      return res.status(404).json({ message: "Componente no encontrado" });
    }

    res.status(200).json(componente);
  } catch (error) {
    console.error("Error al obtener componente:", error);
    res.status(500).json({ message: "Error al obtener componente" });
  }
};

// Actualizar un componente
const updateComponente = async (req, res) => {
  const { id } = req.params;
  const { parteEquipo, imageUrl } = req.body;

  try {
    const componente = await prisma.componente.update({
      where: { id: parseInt(id) },
      data: {
        parteEquipo,
        imageUrl,
      },
    });

    res.status(200).json(componente);
  } catch (error) {
    console.error("Error al actualizar componente:", error);
    res.status(500).json({ message: "Error al actualizar componente" });
  }
};

// Eliminar un componente
const deleteComponente = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.componente.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error al eliminar componente:", error);
    res.status(500).json({ message: "Error al eliminar componente" });
  }
};

// Exportar las funciones del controlador
module.exports = {
  createComponente,
  getAllComponentes,
  getComponenteById,
  updateComponente,
  deleteComponente,
};