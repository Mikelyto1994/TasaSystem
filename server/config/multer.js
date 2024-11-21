// config/multer.js
const multer = require("multer");

// Usar almacenamiento en memoria (en lugar de en disco)
const storage = multer.memoryStorage(); // Guarda los archivos en memoria

const upload = multer({ storage }).single("image"); // "image" es el nombre del campo en el formulario

module.exports = upload;
