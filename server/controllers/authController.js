const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true, // La contraseña en texto plano
        periodoInicio: true, // Necesario para validar el acceso
        periodoFin: true, // Necesario para validar el acceso
      },
    });

    // Si no se encuentra el usuario, devolver un error
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Comparar las contraseñas en texto plano (sin bcrypt)
    if (password !== user.password) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar el JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3h" } // Puedes ajustar la expiración según tu necesidad
    );

    // Enviar la respuesta al cliente
    return res.status(200).json({
      token,
      userId: user.id,
      periodoInicio: user.periodoInicio, // Se mantiene para validaciones
      periodoFin: user.periodoFin, // Se mantiene para validaciones
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res
      .status(500)
      .json({ error: "Error al iniciar sesión. Por favor, intenta más tarde" });
  }
};

module.exports = {
  register,
  login,
};
