// routes/componenteRoutes.js
const express = require('express');
const {
  createComponente,
  getAllComponentes,
  getComponenteById,
  updateComponente,
  deleteComponente,
} = require('../controllers/componenteController');
const authMiddleware = require('../middlewares/auth'); // Importar el middleware de autenticación

const router = express.Router();

// Rutas para el CRUD de componentes
router.post('/', authMiddleware, createComponente); // Crear componente
router.get('/', getAllComponentes); // Obtener todos los componentes
router.get('/:id', getComponenteById); // Obtener componente por ID
router.put('/:id', authMiddleware, updateComponente); // Actualizar componente
router.delete('/:id', authMiddleware, deleteComponente); // Eliminar componente

module.exports = router;