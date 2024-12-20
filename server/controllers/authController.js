const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { prisma } = require("../server"); // Asegúrate de exportar 'prisma' desde el server.js

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
    console.log(`Registro del usuario completado en ${userTime}ms`);

    const totalTime = Date.now() - start;
    console.log(`Proceso de registro completado en ${totalTime}ms`);

    res.status(201).json({ message: "Usuario creado", user: newUser });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// Función de login de usuario
const login = async (req, res) => {
  const start = Date.now(); // Marca el inicio de la operación de login
  try {
    const { username, password } = req.body;

    // Log de inicio de la consulta
    console.log("Iniciando búsqueda de usuario...");
    const userStart = Date.now();

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

    const userTime = Date.now() - userStart;
    console.log(`Consulta de usuario completada en ${userTime}ms`);

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Log de comparación de contraseña
    console.log("Iniciando comparación de contraseña...");
    const bcryptStart = Date.now();

    const isMatch = await bcrypt.compare(password, user.password);

    const bcryptTime = Date.now() - bcryptStart;
    console.log(`Comparación de contraseña completada en ${bcryptTime}ms`);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generación del JWT
    const tokenStart = Date.now();
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    const tokenTime = Date.now() - tokenStart;
    console.log(`Generación del JWT completada en ${tokenTime}ms`);

    const totalTime = Date.now() - start;
    console.log(`Proceso de login completado en ${totalTime}ms`);

    // Enviar el token junto con las fechas del periodo
    res.status(200).json({
      token,
      periodoInicio: user.periodoInicio,
      periodoFin: user.periodoFin,
      loginTime: totalTime, // Tiempo total de ejecución del login
      bcryptTime, // Tiempo de la verificación de la contraseña
      userTime, // Tiempo de la consulta del usuario
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

module.exports = {
  register,
  login,
};
