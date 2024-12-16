// routes/routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const reportController = require("../controllers/reportController");
const authenticateJWT = require("../middlewares/authenticateJWT");

// Rutas de autenticación
router.post("/register", authController.register);
router.post("/login", authController.login);

// Rutas de movimientos (ingreso/egreso)
router.post("/movimiento", authenticateJWT, reportController.createMovement);
router.get("/movimientos", authenticateJWT, reportController.getMovements);

// Nueva ruta para actualizar la imagen de un movimiento
router.put(
  "/movimiento/:id/imagen",
  authenticateJWT,
  reportController.updateMovementImage
);

// Ruta para eliminar un movimiento y su imagen asociada
router.delete(
  "/movimiento/:id",
  authenticateJWT,
  reportController.deleteMovement
);

// Ruta para obtener la información de un usuario sin autenticación
router.get("/user", userController.getUser); // No necesita autenticación

module.exports = router;
