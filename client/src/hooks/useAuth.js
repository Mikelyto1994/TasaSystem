import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Asegúrate de usar la importación correcta

const useAuth = (setAuthenticated) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la ruta actual

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);

        // Solo redirigir a login si la ruta NO es pública
        if (location.pathname !== "/") {
          navigate("/login");
        }
        return;
      }

      try {
        const decoded = jwtDecode(token); // Decodificamos el token JWT
        const expirationTime = decoded.exp * 1000; // Tiempo de expiración en milisegundos

        if (expirationTime < Date.now()) {
          // Si el token ya expiró
          setAuthenticated(false);
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("periodoFin");
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
          localStorage.removeItem("userName");

          if (location.pathname !== "/") {
            navigate("/login");
          }
        } else {
          setAuthenticated(true);
        }
      } catch {
        setAuthenticated(false);
        if (location.pathname !== "/") {
          navigate("/login");
        }
      }
    };

    checkTokenExpiration();

    // Verificamos la expiración cada 30 minutos
    const intervalId = setInterval(checkTokenExpiration, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [navigate, location, setAuthenticated]); // Se ejecuta cuando cambia la ruta
};

export default useAuth;
