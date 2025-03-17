// routes/equipoRoutes.js
const express = require("express");
const {
  createEquipo,
  getAllEquipos,
  getEquipoById,
  getEquiposByZonaId,
  updateEquipo,
  deleteEquipo,
} = require("../controllers/equipoController");
const authMiddleware = require("../middlewares/auth"); // Importar el middleware de autenticación

const router = express.Router();

// Rutas para el CRUD de equipos
router.get("/por-zona/:zonaId", getEquiposByZonaId);
router.post("/", authMiddleware, createEquipo); // Crear equipo
router.get("/", getAllEquipos); // Obtener todos los equipos
router.get("/:id", getEquipoById); // Obtener equipo por ID
router.put("/:id", authMiddleware, updateEquipo); // Actualizar equipo
router.delete("/:id", authMiddleware, deleteEquipo); // Eliminar equipo (solo si el usuario es admin)

module.exports = router;
