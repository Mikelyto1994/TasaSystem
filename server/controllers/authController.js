const jwt = require("jsonwebtoken");
const prisma = require("./prisma"); // Importa desde el archivo prisma.j

// Función de registro de usuario
const register = async (req, res) => {
  const start = Date.now(); // Marca el inicio de la operación de registro
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña son requeridos" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const userStart = Date.now(); // Marca el inicio de la creación del usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const userTime = Date.now() - userStart;

    const totalTime = Date.now() - start;

    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    if (error.code === "P2002") {
      // Si el error es por duplicado en Prisma (usuario ya existe)
      return res
        .status(409)
        .json({ error: "El nombre de usuario ya está en uso" });
    }
    res.status(500).json({
      error: "Error interno del servidor. Por favor, intenta más tarde",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        isAdmin: true, // Asegúrate de incluir isAdmin aquí
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (password !== user.password) {
      return res.status(400).json({ error: "Contraseña incorrecta" }); // Asegurar siempre un mensaje
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      token,
      userId: user.id,
      isAdmin: user.isAdmin, // Asegúrate de incluir isAdmin aquí
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  register,
  login,
};
