// routes/atributoRoutes.js
const express = require('express');
const {
  createAtributo,
  getAllAtributos,
  getAtributoById,
  updateAtributo,
  deleteAtributo,
  getAtributoHistorial,
} = require('../controllers/atributoController');
const authMiddleware = require('../middlewares/auth'); // Importar el middleware de autenticación

const router = express.Router();

// Rutas para el CRUD de atributos
router.post('/', authMiddleware, createAtributo); // Crear atributo
router.get('/', getAllAtributos); // Obtener todos los atributos
router.get('/:id', getAtributoById); // Obtener atributo por ID
router.put('/:id', updateAtributo); // Actualizar atributo
router.delete('/:id', authMiddleware, deleteAtributo); // Eliminar atributo
router.get('/:id/historial', getAtributoHistorial); 

module.exports = router;