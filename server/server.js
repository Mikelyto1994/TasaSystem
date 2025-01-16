const express = require("express");
const prisma = require("./controllers/prisma"); // Importa la instancia centralizada de Prisma
const authenticateJWT = require("./middlewares/authenticateJWT");
const authController = require("./controllers/authController");
const reportController = require("./controllers/reportController");
const upload = require("./config/multer"); // Importa el middleware multer configurado
const cors = require("cors");
const cloudinary = require("./config/cloudinary"); // Importa Cloudinary configurado
const { prismaMiddleware } = require("./middlewares/prismaMiddleware"); // Importa el middleware

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

app.put(
  "/movimiento/:id",
  authenticateJWT, // Middleware para verificar JWT
  reportController.updateMovement // Controlador que maneja la actualización del movimiento
);

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

// **Nueva ruta para obtener los movimientos por área**
app.get(
  "/movimientos/area",
  authenticateJWT,
  reportController.getMovementsByArea
);

// Ruta para eliminar imagen de Cloudinary
app.delete("/api/delete-image", authenticateJWT, async (req, res) => {
  const { publicId, itemId } = req.body;

  if (!publicId || !itemId) {
    return res
      .status(400)
      .json({ message: "publicId y itemId son requeridos" });
  }

  try {
    console.log("🔴 Eliminando imagen con publicId:", publicId);

    // Llamada a Cloudinary para eliminar la imagen
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("✅ Respuesta de Cloudinary:", result);

    if (result.result === "ok") {
      // Si la imagen se eliminó correctamente, actualizar la base de datos
      await prisma.movimiento.update({
        where: { id: Number(itemId) },
        data: { imageUrl: null }, // Limpiar la referencia de la imagen en la base de datos
      });

      // Verificar si la imagen ya fue eliminada de Cloudinary
      try {
        await cloudinary.api.resource(publicId);
        console.log("✅ La imagen sigue existiendo en Cloudinary");
        return res.status(500).json({
          message: "La imagen no se eliminó correctamente en Cloudinary.",
        });
      } catch (error) {
        console.log("✅ Imagen eliminada correctamente de Cloudinary.");
      }

      return res
        .status(200)
        .json({ message: "Imagen eliminada correctamente." });
    } else {
      return res
        .status(500)
        .json({ message: "Error al eliminar la imagen en Cloudinary." });
    }
  } catch (error) {
    console.error("❌ Error al eliminar la imagen:", error);
    return res.status(500).json({ message: "Error al eliminar la imagen." });
  }
});
// Asegúrate de tener esta ruta en tu servidor backend (por ejemplo, en server.js o routes.js)
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

// Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});

// Ruta para obtener el nombre de usuario por userId
app.get("/user/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params; // Extrae el ID del usuario de los parámetros de la URL

  try {
    // Usamos Prisma para buscar al usuario por su ID
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { username: true }, // Solo seleccionamos el campo 'username'
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user); // Devolvemos solo el 'username'
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
});

app.get("/api/categorias", async (req, res) => {
  try {
    // Consulta todas las categorías
    const categorias = await prisma.categoria.findMany({
      select: {
        id: true,
        name: true, // Incluye el nombre de la categoría
      },
    });

    // Si no hay categorías, retorna un mensaje adecuado
    if (!categorias || categorias.length === 0) {
      return res.status(404).json({ message: "No se encontraron categorías" });
    }

    // Retorna las categorías
    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return res.status(500).json({ message: "Error al obtener las categorías" });
  }
});
