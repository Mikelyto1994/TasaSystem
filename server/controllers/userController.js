// controllers/userController.js

const prisma = new PrismaClient(); // Crear una instancia del cliente

// Obtener los datos de un usuario específico
const getUser = async (req, res) => {
  try {
    const userId = req.query.id; // ID del usuario enviado en la query (ej: /user?id=123)

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    // Buscar el usuario por ID e incluir la relación con 'area'
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        area: true, // Incluir la información de la 'area' relacionada
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolver los datos del usuario sin la contraseña
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword); // Excluir la contraseña del resultado
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { getUser };
