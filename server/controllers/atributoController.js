const prisma = require("./prisma");

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
// Actualizar un atributo
const updateAtributo = async (req, res) => {
  const { id } = req.params;
  const { nombre, valor, userId } = req.body;

  try {
    // Verificar si el token es válido
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Solicitud no autorizada" });
    }

    // Obtener el atributo actual para registrar el cambio
    const atributoActual = await prisma.atributo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!atributoActual) {
      return res.status(404).json({ message: "Atributo no encontrado" });
    }

    // Obtener la fecha actual y ajustarla a UTC-5
    const fechaCambio = new Date();
    fechaCambio.setHours(fechaCambio.getHours() - 5); // Ajustar a UTC-5

    // Crear un registro en el historial antes de actualizar
    await prisma.atributoHistorial.create({
      data: {
        atributoId: atributoActual.id,
        valorAnterior: atributoActual.valor,
        valorNuevo: valor,
        userId: userId, // Guardar el userId que hizo el cambio
        fechaCambio: fechaCambio, // Registrar la fecha ajustada
      },
    });

    // Actualizar el atributo
    const updatedAtributo = await prisma.atributo.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        valor,
        userId: userId, // Opcional: actualizar el userId si es necesario
      },
    });

    res.status(200).json(updatedAtributo);
  } catch (error) {
    console.error("Error al actualizar atributo:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Atributo no encontrado" });
    } else if (error.code === "P2002") {
      return res.status(400).json({ message: "Datos inválidos" });
    } else {
      return res.status(500).json({ message: "Error al actualizar atributo" });
    }
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
const getAtributoHistorial = async (req, res) => {
  const { id } = req.params; // ID del atributo

  try {
    const historial = await prisma.atributoHistorial.findMany({
      where: { atributoId: parseInt(id) },
      include: {
        user: true, // Incluir el usuario que hizo el cambio
      },
      orderBy: {
        fechaCambio: 'desc', // Ordenar por fecha de cambio, más reciente primero
      },
    });

    if (historial.length === 0) {
      return res.status(404).json({ message: "No se encontró historial para este atributo." });
    }

    res.status(200).json(historial);
  } catch (error) {
    console.error("Error al obtener el historial del atributo:", error);
    res.status(500).json({ message: "Error al obtener el historial del atributo." });
  }
};
// Exportar las funciones del controlador
module.exports = {
  createAtributo,
  getAllAtributos,
  getAtributoById,
  updateAtributo,
  deleteAtributo,
  getAtributoHistorial,
};