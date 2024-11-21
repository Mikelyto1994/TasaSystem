const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Función de registro de usuario
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña son requeridos" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// Función de login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true, // Asegúrate de que 'password' esté en el 'select'
        periodoInicio: true,
        periodoFin: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Enviar el token junto con las fechas del periodo
    res.status(200).json({
      token,
      periodoInicio: user.periodoInicio,
      periodoFin: user.periodoFin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

module.exports = {
  register,
  login,
};
