// routes/otsRoutes.js
const express = require("express");
const {
  createOT,
  getAllOTs,
  getOTById,
  updateOT,
  deleteOT,
} = require("../controllers/otsController");
const authMiddleware = require("../middlewares/auth"); // Importar el middleware de autenticación

const router = express.Router();

// Rutas para el CRUD de OTs
router.post("/", createOT); // Crear OT
router.get("/", getAllOTs); // Obtener todas las OTs
router.get("/:id", getOTById); // Obtener OT por ID
router.put("/:id", authMiddleware, updateOT); // Actualizar OT
router.delete("/:id", authMiddleware, deleteOT); // Eliminar OT

module.exports = router;
