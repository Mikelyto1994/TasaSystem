// middleware/auth.js
const authMiddleware = (req, res, next) => {
    const user = req.user; // Asumiendo que el usuario está en req.user después de la autenticación
  
    if (!user) {
      return res.status(401).json({ message: "No autenticado" });
    }
  
    // Verificar si el usuario es administrador
    if (!user.isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para realizar esta acción" });
    }
  
    req.user = user; // Pasar el usuario a la siguiente función
    next();
  };
  
  module.exports = authMiddleware;