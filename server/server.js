const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateJWT = require("./middlewares/authenticateJWT");
const authController = require("./controllers/authController");
const reportController = require("./controllers/reportController");
const upload = require("./config/multer"); // Importa el middleware multer configurado
const cors = require("cors");
const cloudinary = require("./config/cloudinary"); // Importa Cloudinary configurado

const app = express();

// Configura CORS
const corsOptions = {
  origin: "*", // Permite solicitudes de cualquier origen mientras pruebas
  methods: "GET,POST,PUT,DELETE", // Métodos HTTP permitidos
  allowedHeaders: "Content-Type,Authorization", // Encabezados permitidos
};

// Usa el middleware cors en todas las rutas
app.use(cors(corsOptions));

const prisma = new PrismaClient();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Rutas de autenticación (registro y login)
app.post("/register", authController.register);
app.post("/login", authController.login);

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
