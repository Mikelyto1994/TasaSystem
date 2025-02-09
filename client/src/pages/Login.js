import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const Login = ({ setAuthenticated, setUserName }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificación de si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("token");

    const storedUserName = localStorage.getItem("userName");

    if (token && storedUserName) {
      navigate("/movimientos");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Por favor, ingrese un nombre de usuario y una contraseña.");
      return;
    }

    setLoading(true);
    try {
      // Llamada al backend para obtener el token, periodoInicio, periodoFin, userId
      const response = await loginUser(username, password);
      const {
        token,
        userId,
        periodoInicio,
        periodoFin,
        username: userNameFromResponse,
      } = response;

      if (!token) {
        throw new Error("No se recibió un token válido.");
      }

      // Actualizamos el username y los demás datos en el localStorage
      localStorage.setItem("userName", userNameFromResponse);

      // Ya guardamos los otros datos en loginUser, no es necesario repetirlo

      // Actualizar el estado de autenticación
      setAuthenticated(true);
      setUserName(userNameFromResponse); // Actualizar el nombre de usuario en el estado

      // Redirigir al usuario a la página de movimientos
      navigate("/movimientos");
    } catch (err) {
      // Mostrar un mensaje de error específico
      setError(err.message || "Credenciales incorrectas. Intenta nuevamente.");
      console.error("Error en el login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Iniciar sesión
        </h2>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-400"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
