const cloudinary = require("cloudinary").v2;

// Configurar las credenciales de Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exporta el objeto de Cloudinary
module.exports = cloudinary;
