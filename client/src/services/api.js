import axiosInstance from "../axios"; // Asegúrate de que la ruta sea correcta

// Funciones para interactuar con el backend (Ejemplo: Login, Movimiento, etc.)

// Login
export const loginUser = async (username, password) => {
  try {
    // Enviar las credenciales al backend para hacer login
    const response = await axiosInstance.post("/login", {
      username,
      password,
    });

    // Verifica la respuesta completa

    // Desestructurar la respuesta para obtener los tiempos
    const {
      token,
      periodoInicio,
      periodoFin,
      loginTime,
      userId,
      bcryptTime,
      userTime,
    } = response.data;

    // Verifica si los tiempos vienen correctamente

    // Guardar el token y las fechas de periodo en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("periodoInicio", periodoInicio);
    localStorage.setItem("periodoFin", periodoFin);

    // Retorna los datos de la respuesta (token, fechas, y tiempos)
    return {
      token,
      periodoInicio,
      periodoFin,
      userId,
      loginTime,
      bcryptTime,
      userTime,
    };
  } catch (error) {
    console.error(
      "Error en el login:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      "Error en el login: " +
        (error.response ? error.response.data.error : error.message)
    );
  }
};

// Registrar un movimiento (Ingreso/Egreso)
export const createMovement = async (movementData) => {
  try {
    const response = await axiosInstance.post("/movimiento", movementData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // Asegúrate de que el backend envíe la URL de la imagen en `response.data`
  } catch (err) {
    console.error("Error en la creación del movimiento:", err);
    throw err;
  }
};

// Obtener los movimientos de un usuario
// Obtener los movimientos con filtros
export const getMovements = async (filters) => {
  try {
    const response = await axiosInstance.get("/movimientos", {
      params: filters, // Pasamos los filtros, incluyendo el área
    });
    return response.data; // Retorna la lista de movimientos filtrados
  } catch (error) {
    console.error("Error al obtener los movimientos:", error);
    throw error;
  }
};

// Función para eliminar el movimiento de la base de datos
export const deleteMovement = async (movementId) => {
  try {
    const response = await axiosInstance.delete(`/movimiento/${movementId}`);
    return response.data; // Retorna la respuesta del backend
  } catch (error) {
    console.error("Error al eliminar el movimiento:", error);
    throw error;
  }
};

// Actualizar la imagen de un movimiento
export const updateMovementImage = async (movementId, imageData) => {
  try {
    // Realiza la solicitud PUT a la API
    const response = await axiosInstance.put(
      `/movimiento/${movementId}/imagen`,
      imageData, // Debes enviar FormData con la imagen
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data; // Devuelve la respuesta con los datos actualizados
  } catch (err) {
    console.error("Error al actualizar la imagen del movimiento:", err);
    throw err;
  }
};
