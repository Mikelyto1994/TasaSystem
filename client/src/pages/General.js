import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getMovements,
  updateMovementImage,
  deleteMovement,
} from "../services/api"; // Asegúrate de importar las funciones correspondientes
import Swal from "sweetalert2";
import axiosInstance from "../axios"; // Asegúrate de importar la instancia correctamente
import axios from "axios";

const General = () => {
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [filter, setFilter] = useState({
    type: "",
    startDate: "",
    endDate: "",
    scope: "misMovimientos",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMovement, setEditMovement] = useState({
    id: null,
    tipoMovimiento: "",
    monto: "",
    descripcion: "",
    categoriaId: "", // Inicializado en vacío
  });
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(""); // Estado para categoría seleccionada

  const [categoriaId, setCategoriaId] = useState(""); // Inicializado en vacío

  // Sincroniza categoriaId con editMovement.categoriaId
  useEffect(() => {
    if (editMovement) {
      setSelectedCategoriaId(editMovement.categoriaId);
    }
  }, [editMovement]);

  const userId = localStorage.getItem("userId"); // Este valor debe provenir de tu sistema de autenticación

  const [responsibleNames, setResponsibleNames] = useState({});
  useEffect(() => {}, [editMovement]);

  const refreshReport = async () => {
    fetchMovements();
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (filter.scope === "misMovimientos") {
        response = await getMovements(filter); // Ya estás enviando el objeto filter
      } else if (filter.scope === "miGrupo") {
        response = await axiosInstance.get("/movimientos/area", {
          params: filter, // Aquí también se envía el filtro
        });
      }

      const movements = Array.isArray(response) ? response : response.data;

      if (!Array.isArray(movements)) {
        throw new Error("La respuesta de la API no contiene un array válido.");
      }

      let filtered = [...movements];

      if (filter.type) {
        filtered = filtered.filter(
          (movement) => movement.tipoMovimiento === filter.type
        );
      }

      if (filter.categoria && filter.categoria !== "") {
        // Convertimos ambos valores a cadenas antes de comparar
        filtered = filtered.filter(
          (movement) => movement.categoria.id.toString() === filter.categoria
        );
      }

      setFilteredMovements(filtered);
    } catch (err) {
      setError("Error al cargar los movimientos");
      console.error("Error al cargar los movimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/categorias`
        );
        setCategorias(response.data);

        // Establecer "Sin categoría" como valor predeterminado si está presente
        const todasCategoria = response.data.find(
          (c) => c.name === "Sin categoria"
        );
        if (todasCategoria) {
          setCategoriaId(todasCategoria.id);
          setEditMovement((prev) => ({
            ...prev,
            categoriaId: todasCategoria.id, // Asignar al estado del movimiento
          }));
        }
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    fetchCategorias();
  }, []); // ⚠️ Aquí quitamos `editMovement` y `setEditMovement` de las dependencias

  const handleCategoryChange = (e) => {
    const nuevaCategoriaId = parseInt(e.target.value, 10);

    setEditMovement((prev) => {
      return { ...prev, categoriaId: nuevaCategoriaId };
    });
  };

  useEffect(() => {
    const fetchResponsibleNames = async () => {
      const names = {};

      // Para cada movimiento, obtenemos el nombre del responsable
      for (const movement of filteredMovements) {
        if (movement.userId && !names[movement.userId]) {
          try {
            const username = await getUsernameById(movement.userId);
            names[movement.userId] = username;
          } catch (err) {
            names[movement.userId] = "Desconocido"; // Si hay error, devolvemos 'Desconocido'
          }
        }
      }

      setResponsibleNames(names);
    };

    if (filteredMovements.length > 0) {
      fetchResponsibleNames();
    }
  }, [filteredMovements]);

  const getUsernameById = async (userId) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      return response.data.username; // Devolvemos el username
    } catch (error) {
      console.error("Error al obtener el username:", error);
      return "Desconocido"; // Si hay error, devolvemos 'Desconocido'
    }
  };

  const updateMovement = async (movementId, updatedData) => {
    try {
      // Obtener el token desde localStorage
      const token = localStorage.getItem("token");

      // Configurar los encabezados con el token de autenticación
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Agregar el token JWT en el header
        },
      };

      // Hacer la solicitud PUT con el token en los encabezados
      const response = await axiosInstance.put(
        `/movimiento/${movementId}`,
        updatedData,
        config // Pasar los encabezados como parte de la configuración
      );

      return response.data;
    } catch (error) {
      console.error("Error al actualizar movimiento:", error);
      throw new Error("Error al actualizar el movimiento");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMovements();
  };

  const handleDelete = async (movementId, imageUrl, movementUserId) => {
    // Asegúrate de que ambos valores sean números para evitar problemas de comparación
    if (parseInt(userId) !== parseInt(movementUserId)) {
      // Si no es el creador, mostramos el SweetAlert
      Swal.fire({
        title: "Acción no permitida",
        text: "No puedes ejecutar esta acción, no eres el usuario que creó este movimiento.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return; // No continuar con la eliminación
    }

    // Si el usuario es el creador, procedemos con la eliminación
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este movimiento será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMovement(movementId);

      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl, movementId); // ✅ Pasa movementId correctamente
      }

      setFilteredMovements((prevMovements) =>
        prevMovements.filter((mov) => mov.id !== movementId)
      );

      Swal.fire(
        "¡Eliminado!",
        "El movimiento ha sido eliminado correctamente.",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error",
        "Hubo un problema al eliminar el movimiento.",
        "error"
      );
      console.error("Error al eliminar:", err);
    }
  };

  const deleteImageFromCloudinary = async (imageUrl, itemId) => {
    if (!imageUrl || !itemId) {
      console.error("❌ Error: imageUrl o itemId no proporcionados.", {
        imageUrl,
        itemId,
      });
      toast.error("Error: No se puede eliminar la imagen.");
      return;
    }

    const publicId = extractPublicIdFromImageUrl(imageUrl);

    try {
      const response = await axiosInstance.delete("/api/delete-image", {
        data: { publicId, itemId }, // Enviar ambos valores correctamente
      });

      if (response.status === 200) {
        console.log("✅ Imagen eliminada correctamente.");
        toast.success("Imagen eliminada correctamente.");
      } else {
        throw new Error("No se pudo eliminar la imagen de Cloudinary.");
      }
    } catch (err) {
      console.error("❌ Error al eliminar imagen:", err);
      toast.error("Error al eliminar la imagen.");
    }
  };

  const extractPublicIdFromImageUrl = (imageUrl) => {
    const regex =
      /https:\/\/res.cloudinary.com\/[a-z0-9]+\/image\/upload\/v[0-9]+\/(.+)\.(jpg|png|jpeg)/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null;
  };

  const handleOpenImageModal = (movement) => {
    setSelectedMovement(movement);
    setImageModalOpen(true);
  };

  // Verifica si el usuario actual es el creador del movimiento
  const isOwner =
    selectedMovement && parseInt(userId) === parseInt(selectedMovement.userId);

  const handleImageUpload = async (e) => {
    e.preventDefault();

    // Verificar que el usuario es el propietario
    if (!isOwner) {
      Swal.fire({
        title: "Acción no permitida",
        text: "No puedes añadir, actualizar ni eliminar la imagen, no eres el usuario que creó este movimiento.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Verificar que haya una imagen seleccionada
    if (!image) {
      toast.error("Por favor selecciona una imagen.");
      return;
    }

    console.log("🔍 selectedMovement:", selectedMovement);
    console.log("🔍 selectedMovement.id:", selectedMovement?.id);
    console.log("🔍 selectedMovement.imageUrl:", selectedMovement?.imageUrl);

    if (!selectedMovement?.id) {
      toast.error(
        "Error: No se puede actualizar la imagen, falta el ID del movimiento."
      );
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      // Si hay una imagen previa, la eliminamos antes de subir la nueva
      if (selectedMovement?.imageUrl) {
        console.log(
          "🔴 Eliminando imagen anterior:",
          selectedMovement.imageUrl
        );
        await deleteImageFromCloudinary(
          selectedMovement.imageUrl,
          selectedMovement.id
        );
      }

      // Ahora subimos la nueva imagen
      console.log("🔵 Subiendo nueva imagen...");
      await updateMovementImage(selectedMovement.id, formData);

      toast.success("Imagen actualizada correctamente.");
      fetchMovements(); // Refrescar la lista de movimientos
      setImageModalOpen(false);
      await refreshReport();
    } catch (err) {
      toast.error("Error al actualizar la imagen.");
      console.error("❌ Error al actualizar la imagen:", err);
    }
  };

  const handleImageDelete = async (imageUrl) => {
    // Verificar que el usuario es el propietario
    if (!isOwner) {
      Swal.fire({
        title: "Acción no permitida",
        text: "No puedes eliminar la imagen, no eres el usuario que creó este movimiento.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      // Eliminar imagen de Cloudinary
      console.log("🔴 Eliminando imagen de Cloudinary:", imageUrl);
      await deleteImageFromCloudinary(imageUrl, selectedMovement.id);
      setImageModalOpen(false);
      fetchMovements(); // Refrescar la lista de movimientos

      toast.success("Imagen eliminada correctamente.");

      await refreshReport();
    } catch (err) {
      toast.error("Error al eliminar la imagen.");
      console.error("❌ Error al eliminar la imagen:", err);
    }
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  // Calcular totales de Ingresos, Egresos y Diferencia
  const calculateTotals = () => {
    let totalIngreso = 0;
    let totalEgreso = 0;

    filteredMovements.forEach((movement) => {
      if (movement.tipoMovimiento === "ingreso") {
        totalIngreso += movement.monto;
      } else if (movement.tipoMovimiento === "egreso") {
        totalEgreso += movement.monto;
      }
    });

    const totalDiferencia = totalIngreso - totalEgreso;

    return { totalIngreso, totalEgreso, totalDiferencia };
  };

  const { totalIngreso, totalEgreso, totalDiferencia } = calculateTotals();

  const handleActionSelect = (action, movement) => {
    if (!action) return; // Evitar acciones vacías
    switch (action) {
      case "image":
        setSelectedMovement(movement); // Asegurarte de asignar el movimiento seleccionado
        setImageModalOpen(true); // Abrir el modal
        break;
      case "delete":
        handleDelete(movement.id, movement.imageUrl, movement.userId);
        break;
      default:
        break;
    }
  };

  const handleOpenEditModal = (movement) => {
    if (parseInt(userId) !== parseInt(movement.userId)) {
      Swal.fire({
        title: "Acción no permitida",
        text: "No puedes editar este movimiento, no eres el usuario que lo creó.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return; // No abrir el modal si no es el propietario
    }

    setEditMovement(movement); // Asignar el movimiento a editar
    setEditModalOpen(true); // Abrir el modal
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Reporte General
      </h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-4 bg-gray-50 p-4 rounded-md shadow-md"
      >
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Tipo de Movimiento
          </label>
          <select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Todo</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Desde
          </label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Hasta
          </label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Por:</label>
          <select
            name="scope"
            value={filter.scope}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="misMovimientos">Mis movimientos</option>
            <option value="miGrupo">Mi grupo</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Categoría
          </label>
          <select
            name="categoria"
            value={filter.categoria || ""} // Asegúrate de que el valor sea vacío cuando no se aplique el filtro
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Sin este filtro</option>{" "}
            {/* Esta es la nueva opción */}
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Mensajes de carga o error */}
      {loading && <p className="text-center text-blue-500 mt-4">Cargando...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {/* Nueva fila con los totales */}
      <div className="flex justify-between mt-4">
        <div>
          <span className="font-semibold text-lg">Total Ingreso: </span>
          <span className="text-green-500">
            {totalIngreso.toFixed(2)} Soles
          </span>
        </div>
        <div>
          <span className="font-semibold text-lg">Total Egreso: </span>
          <span className="text-red-500">{totalEgreso.toFixed(2)} Soles</span>
        </div>
        <div>
          <span className="font-semibold text-lg">Total Diferencia: </span>
          <span
            className={totalDiferencia >= 0 ? "text-green-500" : "text-red-500"}
          >
            {totalDiferencia.toFixed(2)} Soles
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto">
        <div className="inline-block min-w-full overflow-x-auto">
          <table className="min-w-full border-collapse bg-white border border-gray-300 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Fecha
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Tipo Movimiento
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Categoría
                </th>{" "}
                {/* Nueva columna */}
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Descripción
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Monto
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Responsable
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Acciones:
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No se encontraron movimientos.
                  </td>
                </tr>
              ) : (
                filteredMovements
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(
                          new Date(movement.fecha).setDate(
                            new Date(movement.fecha).getDate() + 1
                          )
                        ).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {movement.tipoMovimiento}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {movement.categoria.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {movement.descripcion}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {movement.monto}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {responsibleNames[movement.userId] || "Cargando..."}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <select
                          className="p-2 border rounded-md"
                          value=""
                          onChange={(e) => {
                            const action = e.target.value;
                            e.target.value = ""; // Restablece el valor del select

                            if (action === "edit") {
                              // Llamamos a handleOpenEditModal cuando se selecciona "editar"
                              handleOpenEditModal(movement);
                            } else if (action === "image") {
                              handleOpenImageModal(movement);
                            } else if (action === "delete") {
                              handleDelete(
                                movement.id,
                                movement.imageUrl,
                                movement.userId
                              );
                            }
                          }}
                        >
                          <option value="">Escoger acción</option>
                          <option value="edit">Editar</option>{" "}
                          {/* Nueva opción de editar */}
                          {movement.imageUrl ? (
                            <option value="image">Ver Imagen</option>
                          ) : (
                            <option value="image">Añadir Imagen</option>
                          )}
                          <option value="delete">Eliminar</option>
                        </select>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de imagen */}
      {imageModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMovement?.imageUrl
                ? "Actualizar Imagen"
                : "Añadir Imagen"}
            </h2>
            <form onSubmit={handleImageUpload}>
              <div className="mb-4">
                {selectedMovement?.imageUrl ? (
                  <div>
                    <p>Imagen actual:</p>
                    <a
                      href={selectedMovement.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={selectedMovement.imageUrl}
                        alt="Imagen actual"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </a>
                    <p className="mt-2">¿Quieres cambiarla?</p>
                    <input
                      type="file"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      accept=".png, .jpeg, .jpg"
                      disabled={!isOwner} // Deshabilitar si el usuario no es el propietario
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleImageDelete(selectedMovement.imageUrl)
                      }
                      className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Eliminar Imagen
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      accept=".png, .jpeg, .jpg"
                      disabled={!isOwner} // Deshabilitar si el usuario no es el propietario
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="bg-red-400 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                {isOwner ? (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md"
                  >
                    {selectedMovement?.imageUrl ? "Actualizar" : "Subir"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed"
                    disabled
                  >
                    Acción no permitida
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Editar Movimiento</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updatedMovement = {
                    ...editMovement,
                    categoriaId: editMovement.categoriaId,
                  };

                  await updateMovement(updatedMovement.id, updatedMovement);
                  toast.success("Movimiento actualizado correctamente.");
                  fetchMovements();
                  setEditModalOpen(false); // Cerrar modal
                } catch (error) {
                  toast.error("Error al actualizar el movimiento.");
                  console.error("Error al actualizar movimiento:", error);
                }
              }}
            >
              <div className="mb-4">
                <label className="block font-semibold">
                  Tipo de Movimiento
                </label>
                <select
                  value={editMovement?.tipoMovimiento}
                  onChange={(e) =>
                    setEditMovement({
                      ...editMovement,
                      tipoMovimiento: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Monto</label>
                <input
                  type="number"
                  value={editMovement?.monto}
                  onChange={(e) =>
                    setEditMovement({ ...editMovement, monto: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Descripción</label>
                <input
                  type="text"
                  value={editMovement?.descripcion}
                  onChange={(e) =>
                    setEditMovement({
                      ...editMovement,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Categoría</label>
                <select
                  value={editMovement?.categoriaId || ""}
                  onChange={handleCategoryChange}
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default General;
