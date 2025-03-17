// routes/consumibleRoutes.js
const express = require('express');
const {
  createConsumible,
  getAllConsumibles,
  getConsumibleById,
  updateConsumible,
  deleteConsumible,
} = require('../controllers/consumibleController');

const authMiddleware = require('../middlewares/auth'); 

const router = express.Router();

// Rutas para el CRUD de consumibles
router.post('/', createConsumible); // Crear consumible
router.get('/', getAllConsumibles); // Obtener todos los consumibles
router.get('/:id', getConsumibleById); // Obtener consumible por ID
router.put('/:id', updateConsumible); // Actualizar consumible
router.delete('/:id', authMiddleware, deleteConsumible); 

module.exports = router;