import axios from "axios";

// Crear la instancia de Axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Usar la variable de entorno para la URL base
  headers: {
    "Content-Type": "application/json", // Asegurarnos de que el tipo de contenido es JSON
  },
  timeout: 4000, // Tiempo de espera de la solicitud en 10 segundos (ajustable)
});

// Interceptor para agregar el token JWT en cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token del localStorage

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Si hay token, agregar a las cabeceras
    }
    return config; // Retornar la configuración para continuar con la solicitud
  },
  (error) => {
    // Si hay un error en la solicitud antes de enviarla
    console.error("Error en la solicitud:", error);
    return Promise.reject(error); // Devolver el error
  }
);

// Interceptor para manejar las respuestas de forma global
axiosInstance.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta tiene el tipo de contenido 'application/json'
    if (
      response.headers["content-type"] &&
      response.headers["content-type"].includes("application/json")
    ) {
      // Asegurarnos de que los datos de la respuesta sean un JSON válido
      try {
        JSON.parse(JSON.stringify(response.data)); // Intentar convertir los datos a JSON
      } catch (e) {
        // Si no es un JSON válido, devolver un error
        console.error("Respuesta no es un JSON válido", response);
        return Promise.reject(
          new Error("La respuesta no es un formato JSON válido")
        );
      }
    }
    return response; // Si todo es correcto, retornar la respuesta
  },
  (error) => {
    // Si hay un error con la respuesta
    if (error.response) {
      // Si el servidor responde con un código de error (ejemplo: 404, 500)
      console.error("Error en la respuesta del servidor:", error.response.data);
      console.error("Código de estado:", error.response.status);
      console.error("Headers:", error.response.headers);

      // Puedes agregar lógica para manejar ciertos códigos de error como 401 (no autorizado)
      if (error.response.status === 401) {
        // Si el token ha expirado o es inválido, eliminarlo del localStorage y redirigir al login
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirigir al login
      }

      return Promise.reject(error.response); // Devolver la respuesta de error para que el frontend lo maneje
    } else if (error.request) {
      // Si no hay respuesta del servidor
      console.error("No hubo respuesta del servidor:", error.request);
      return Promise.reject(new Error("No hubo respuesta del servidor"));
    } else {
      // Si hubo un error al configurar la solicitud
      console.error("Error al configurar la solicitud:", error.message);
      return Promise.reject(new Error("Error al configurar la solicitud"));
    }
  }
);

export default axiosInstance;
