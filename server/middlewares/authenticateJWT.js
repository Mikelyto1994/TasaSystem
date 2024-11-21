const jwt = require("jwt-simple");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(403).send("Token requerido");

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded; // Guardar el ID del usuario en la solicitud
    next();
  } catch (e) {
    res.status(403).send("Token inválido");
  }
};

module.exports = authenticateJWT;
