import axiosInstance from "../axios"; // Asegúrate de que la ruta sea correcta

// Funciones para interactuar con el backend (Ejemplo: Login, Movimiento, etc.)

// Login
export const loginUser = async (username, password) => {
  try {
    // Realiza la solicitud de inicio de sesión
    const response = await axiosInstance.post("/login", { username, password });

    // Desestructura los datos de la respuesta
    const { token, userId, isAdmin } = response.data;

    // Agregar un console.log para ver la respuesta completa
    console.log("Respuesta del servidor:", response.data);

    // Verifica que todos los datos necesarios estén presentes
    if (!token || !userId) {
      throw new Error("Datos incompletos en la respuesta del servidor");
    }

    // Almacena los datos en el localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", username);
    localStorage.setItem("isAdmin", isAdmin); // Almacena si el usuario es administrador

    // Devuelve los datos del usuario
    return { token, userId, username, isAdmin };
  } catch (error) {
    console.error("Error en el login:", error);

    let errorMessage = "Error desconocido al iniciar sesión";

    if (error.response) {
      // Si el backend envió un mensaje de error, lo mostramos
      errorMessage = error.response.data?.error || "Error en la autenticación";
    } else if (error.request) {
      errorMessage = "No se pudo conectar con el servidor";
    } else {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const createOT = async (otData, token) => {
  try {
    const response = await axiosInstance.post("/ots/", otData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Agregar el token de autorización
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error en la creación de OT:", err);
    throw err;
  }
};

export const createOTConsumible = async (otConsumibleData, token) => {
  try {
    const response = await axiosInstance.post("/otc", otConsumibleData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Agregar el token de autorización
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error en la creación de OTConsumible:", err);
    throw err;
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
