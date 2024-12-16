import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Asegúrate de usar la importación correcta

const useAuth = (setAuthenticated) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token); // Decodificamos el token JWT
        const expirationTime = decoded.exp * 1000; // Tiempo de expiración en milisegundos

        if (expirationTime < Date.now()) {
          // Si el token ya expiró
          setAuthenticated(false);
          localStorage.removeItem("periodoInicio");
          localStorage.removeItem("periodoFin");
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          navigate("/login");
        } else {
          setAuthenticated(true);
        }
      } catch {
        // Si no se puede decodificar el token, consideramos que no está autenticado
        setAuthenticated(false);
        navigate("/login");
      }
    };

    // Verificamos la expiración del token inmediatamente al cargar la página
    checkTokenExpiration();

    // Configuramos un intervalo para verificar la expiración cada 30 minutos
    const intervalId = setInterval(checkTokenExpiration, 30 * 60 * 1000); // 30 minutos en milisegundos

    // Limpiamos el intervalo cuando el componente se desmonte o cambie la autenticación
    return () => clearInterval(intervalId);
  }, [navigate, setAuthenticated]);
};

export default useAuth;
