import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAuth = (setAuthenticated) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtenemos la ruta actual

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);

        // Solo redirigir a login si NO estamos en Home
        if (location.pathname !== "/") {
          navigate("/login");
        }

        return;
      }

      try {
        const decoded = jwtDecode(token);
        const expirationTime = decoded.exp * 1000;

        if (expirationTime < Date.now()) {
          setAuthenticated(false);
          localStorage.removeItem("periodoInicio");
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
    const intervalId = setInterval(checkTokenExpiration, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [navigate, location, setAuthenticated]);
};

export default useAuth;
