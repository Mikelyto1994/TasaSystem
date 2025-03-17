const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener los datos de un usuario específico
const getUser  = async (req, res) => {
  try {
    const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la URL

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Buscar el usuario por ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        area: true,
        ots: true,
        otConsumibles: true,
        componentes: true,
        repuestos: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolver todos los datos del usuario
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { getUser  };