// routes/locationRoutes.js
const express = require("express");
const locationController = require("../controllers/varios");

const router = express.Router();

// Ruta para obtener todas las áreas
router.get("/areas", locationController.getAllAreas);

// Ruta para obtener todas las zonas
router.get("/zonas", locationController.getAllZonas);

// Ruta para obtener todas las ubicaciones
router.get("/ubicaciones", locationController.getAllUbicaciones);

router.get("/ubicaciones/por-zona", locationController.getUbicacionesPorZona);

module.exports = router;
