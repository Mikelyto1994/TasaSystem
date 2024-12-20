const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateJWT = require("./middlewares/authenticateJWT");
const authController = require("./controllers/authController");
const reportController = require("./controllers/reportController");
const upload = require("./config/multer"); // Importa el middleware multer configurado
const cors = require("cors");
const cloudinary = require("./config/cloudinary"); // Importa Cloudinary configurado
const { prismaMiddleware } = require("./middlewares/prismaMiddleware"); // Importa el middleware

// Crear una única instancia de PrismaClient para usar en toda la aplicación
const prisma = new PrismaClient();

// Configuración de la aplicación
const app = express();

// Configura CORS
const corsOptions = {
  origin: "*", // Permite solicitudes desde cualquier origen mientras pruebas
  methods: "GET,POST,PUT,DELETE", // Métodos HTTP permitidos
  allowedHeaders: "Content-Type,Authorization", // Encabezados permitidos
};

// Usa el middleware cors en todas las rutas
app.use(cors(corsOptions));

// Aplicar el middleware de Prisma
prisma.$use(prismaMiddleware); // Aplica el middleware aquí

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Rutas de autenticación (registro y login)
app.post("/register", authController.register);
app.post("/login", authController.login);

// Ruta GET /user para obtener los usuarios, incluyendo la contraseña (para pruebas)
app.get("/user", async (req, res) => {
  try {
    // Obtener todos los usuarios de la base de datos
    const users = await prisma.user.findMany({
      include: {
        area: true, // Incluir la información relacionada con 'area'
      },
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay usuarios en la base de datos" });
    }

    // Devolver los usuarios (incluyendo la contraseña para pruebas)
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
});

// Ruta para crear un movimiento (con imagen)
app.post(
  "/movimiento",
  authenticateJWT, // Middleware para verificar JWT
  upload, // Middleware de multer que maneja la carga del archivo
  reportController.createMovement // Controlador que maneja la lógica de la imagen
);

// Ruta para actualizar la imagen de un movimiento
app.put(
  "/movimiento/:id/imagen", // Ruta para actualizar la imagen de un movimiento
  authenticateJWT, // Middleware para verificar JWT
  upload, // Middleware de multer para manejar la carga de la imagen
  (req, res, next) => {
    next(); // Pasa al controlador
  },
  reportController.updateMovementImage // Controlador que maneja la actualización de la imagen
);

// Ruta para obtener los movimientos
app.get("/movimientos", authenticateJWT, reportController.getMovements);

// Ruta para eliminar un movimiento
app.delete("/movimiento/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params; // Extrae el ID del movimiento de los parámetros de la URL

  try {
    // Usamos Prisma para eliminar el movimiento por su ID
    const deletedMovement = await prisma.movimiento.delete({
      where: { id: Number(id) }, // Asegúrate de que el ID es un número
    });

    if (!deletedMovement) {
      return res.status(404).json({ message: "Movimiento no encontrado" });
    }

    res.status(200).json({ message: "Movimiento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el movimiento:", error);
    res.status(500).json({ message: "Error al eliminar el movimiento" });
  }
});

// Ruta para eliminar imagen de Cloudinary
app.delete("/api/delete-image", authenticateJWT, async (req, res) => {
  const { publicId } = req.body; // El publicId de la imagen que se eliminará

  try {
    // Llamada a Cloudinary para eliminar la imagen
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ message: "Imagen eliminada correctamente" });
    } else {
      return res.status(500).json({ message: "Error al eliminar la imagen" });
    }
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    res.status(500).json({ message: "Error al eliminar la imagen" });
  }
});

// Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});
