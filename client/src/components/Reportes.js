import React, { useState, useEffect } from "react";
import axiosInstance from "../axios";
import { toast } from "react-toastify";
import { getMovements, updateMovementImage } from "../services/api";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";

const Reportes = () => {
  const [categoriaId, setCategoriaId] = useState(""); // Para manejar la categoría seleccionada
  const [categorias, setCategorias] = useState([]);
  const [mes, setMes] = useState("");
  const [año, setAño] = useState("");
  const [ingresos, setIngresos] = useState(0);
  const [egresos, setEgresos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleMovimiento, setDetalleMovimiento] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [image, setImage] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [filtroMovimiento, setFiltroMovimiento] = useState("mis"); // Filtro que captura "mis" o "grupo"
  // Asegúrate de que movementUserId esté siendo asignado correctamente
  const [movementUserId, setMovementUserId] = useState(null);

  const userIdLocal = localStorage.getItem("userId");

  // Verificar si el usuario puede añadir imagen o eliminar movimiento
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/categorias`
        );
        setCategorias(response.data);

        // Establecer "Todas" como valor predeterminado si está presente
        const todasCategoria = response.data.find(
          (c) => c.name === "Sin este filtro"
        );
        if (todasCategoria) {
          setCategoriaId(todasCategoria.id); // Establecer "Todas" como predeterminada
        }
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    fetchCategorias();
  }, []); // Solo se ejecuta una vez al cargar el componente

  // Abrir modal para cargar imagen solo si el usuario es el creador
  const openImageModal = (movement) => {
    if (parseInt(userIdLocal) !== parseInt(movement.userId)) {
      // Si no eres el creador, mostramos el SweetAlert
      Swal.fire({
        title: "Acción no permitida",
        text: "No puedes añadir una imagen, no eres el usuario que creó este movimiento.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return; // No abrimos el modal
    }
    setSelectedMovimiento(movement);
    setImageModalOpen(true);
  };

  // Función para cargar el reporte con el filtro "Por" (Mis movimientos o Mi grupo)
  const refreshReport = async () => {
    if (!mes || !año) {
      toast.error("Por favor, selecciona mes y año.");
      return;
    }

    // Crear las fechas de inicio y fin según el mes y el año
    const startDate = new Date(Date.UTC(año, mes - 1, 1));
    const endDate = new Date(Date.UTC(año, mes, 0));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    setLoading(true);

    try {
      let data;

      // Incluye la categoría en los parámetros de la solicitud si se necesita
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        categoriaId: categoriaId || undefined, // Si la categoría está seleccionada, se pasa, si no, no se incluye
      };

      if (filtroMovimiento === "grupo") {
        const response = await axiosInstance.get("/movimientos/area", {
          params,
        });
        data = response.data;
      } else {
        data = await getMovements({ params, filtro: filtroMovimiento });
      }

      // Filtrar los movimientos por el rango de fechas (startDate - endDate)
      let filteredData = data.filter((mov) => {
        const movDate = new Date(mov.fecha);
        return movDate >= startDate && movDate <= endDate;
      });

      // Si se ha seleccionado una categoría (y no es la opción "Sin filtro"), filtrar los movimientos por la categoría
      if (categoriaId && categoriaId !== "") {
        filteredData = filteredData.filter(
          (mov) => mov.categoria.id === categoriaId
        );
      }

      // Continuar con el procesamiento de los movimientos
      const movimientosConResponsable = await Promise.all(
        filteredData.map(async (mov) => {
          try {
            const response = await axiosInstance.get(`/user/${mov.userId}`);
            const username = response.data.username;
            return {
              ...mov,
              responsable: username || "No asignado",
              movementUserId: mov.userId,
            };
          } catch (err) {
            return {
              ...mov,
              responsable: "No asignado",
              movementUserId: mov.userId,
            };
          }
        })
      );

      setMovimientos(movimientosConResponsable);

      // Calcular ingresos y egresos
      const ingresosTotal = movimientosConResponsable
        .filter((mov) => mov.tipoMovimiento === "ingreso")
        .reduce((sum, mov) => sum + mov.monto, 0);
      const egresosTotal = movimientosConResponsable
        .filter((mov) => mov.tipoMovimiento === "egreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      setIngresos(ingresosTotal);
      setEgresos(egresosTotal);
    } catch (err) {
      toast.error("Error al obtener los reportes.");
      console.error("Error al obtener los reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la función de refresco al hacer submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await refreshReport();
  };

  // Abrir el modal de detalles del movimiento
  const openModal = (tipo) => {
    setTipoMovimiento(tipo);
    const filteredMovements = movimientos.filter(
      (mov) => mov.tipoMovimiento === tipo
    );
    setDetalleMovimiento(filteredMovements);
    setModalOpen(true);
    setModalKey((prevKey) => prevKey + 1);
  };

  // Cerrar el modal de detalles
  const closeModal = () => {
    setModalOpen(false);
    setDetalleMovimiento([]);
    setModalKey((prevKey) => prevKey + 1);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setImage(null);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      await updateMovementImage(selectedMovimiento.id, formData);
      toast.success("Imagen cargada correctamente.");
      await refreshReport();
      closeImageModal();
      closeModal();
    } catch (err) {
      toast.error("Error al cargar la imagen.");
      console.error("Error al cargar la imagen:", err);
    }
  };

  // Formato de fecha
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", fecha);
      return "";
    }

    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("es-PE");
  };

  const obtenerReporte = async () => {
    try {
      const response = await fetch("/api/movimientos"); // Reemplaza con tu API real
      const data = await response.json();
      setMovimientos(data); // Actualiza el estado con los movimientos más recientes
    } catch (error) {
      console.error("Error al obtener el reporte:", error);
    }
  };

  // Eliminar un movimiento
  const handleDelete = async (movementId, imageUrl, movementUserId) => {
    if (parseInt(userIdLocal) !== parseInt(movementUserId)) {
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
      // Primero eliminamos el movimiento en la base de datos

      // Si el movimiento tiene una imagen, eliminamos la imagen de Cloudinary
      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl, movementId); // ✅ Pasa movementId correctamente
      }
      await deleteMovement(movementId);
      // Eliminar el movimiento de la lista local de movimientos
      setMovimientos((prevMovimientos) =>
        prevMovimientos.filter((mov) => mov.id !== movementId)
      );

      // Cerrar el modal de detalles después de eliminar el movimiento
      closeModal();

      // Aquí llamamos la función que obtiene el reporte (esto actualizará la lista)
      refreshReport(); // Simulando el "clic" en el botón Obtener reporte

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

  const deleteImageFromCloudinary = async (imageUrl) => {
    const publicId = extractPublicIdFromImageUrl(imageUrl);

    try {
      const response = await axiosInstance.delete("/api/delete-image", {
        data: { publicId },
      });

      if (response.status !== 200) {
        throw new Error("No se pudo eliminar la imagen de Cloudinary.");
      }
    } catch (err) {
      throw new Error("No se pudo eliminar la imagen de Cloudinary.");
    }
  };

  // Extraer el ID público de la URL de la imagen
  const extractPublicIdFromImageUrl = (imageUrl) => {
    const regex =
      /https:\/\/res.cloudinary.com\/[a-z0-9]+\/image\/upload\/v[0-9]+\/(.+)\.(jpg|png|jpeg)/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null;
  };

  // Eliminar un movimiento
  const deleteMovement = async (movementId) => {
    try {
      const response = await axiosInstance.delete(`/movimiento/${movementId}`);
      if (!response.status === 200) {
        throw new Error("No se pudo eliminar el movimiento.");
      }
    } catch (err) {
      throw new Error("No se pudo eliminar el movimiento.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        Reportes de Movimientos
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor="mes"
              className="block text-lg font-medium text-gray-700"
            >
              Mes
            </label>
            <select
              id="mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Selecciona un mes</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="año"
              className="block text-lg font-medium text-gray-700"
            >
              Año
            </label>
            <input
              id="año"
              type="number"
              value={año}
              onChange={(e) => setAño(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Año"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Contenedor flex para alinearlos al lado */}
          <div className="flex items-center">
            {/* Para mantener la etiqueta y el select alineados */}
            <label
              htmlFor="filtroMovimiento"
              className="text-lg font-medium mr-2"
            >
              Ver por:
            </label>
            <select
              id="filtroMovimiento"
              value={filtroMovimiento}
              onChange={(e) => {
                setFiltroMovimiento(e.target.value);
              }}
              className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="mis">Mis movimientos</option>
              <option value="grupo">Mi grupo</option>
            </select>
          </div>
          <div className="flex items-center">
            {/* Contenedor del segundo select */}
            <label
              htmlFor="categoria"
              className="block text-lg font-medium text-gray-700 mr-7 ml-5"
            >
              Categoría
            </label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full sm:w-auto mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
        >
          Obtener Reporte
        </button>
      </form>

      {/* Mostrar reporte de ingresos y egresos */}
      {loading ? (
        <div className="text-center mt-6">Cargando reportes...</div>
      ) : (
        <>
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">Ingresos</h3>
            <p className="text-xl text-green-500">
              {ingresos.toFixed(2)} Soles
            </p>
            <button
              className="mt-2 text-sm text-blue-500 border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => openModal("ingreso")}
            >
              Ver Detalles
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">Egresos</h3>
            <p className="text-xl text-red-500">{egresos.toFixed(2)} Soles</p>
            <button
              className="mt-2 text-sm text-blue-500 border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => openModal("egreso")}
            >
              Ver Detalles
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">
              Balance Total
            </h3>
            <p
              className={`text-xl font-semibold ${
                ingresos - egresos >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {(ingresos - egresos).toFixed(2)} Soles
            </p>
          </div>
        </>
      )}

      {/* Modal para detalles de movimientos */}
      {modalOpen && detalleMovimiento.length > 0 && (
        <div
          key={modalKey}
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            {/* Título con botón de cerrar */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-700">
                Detalles de{" "}
                {tipoMovimiento === "ingreso" ? "Ingresos" : "Egresos"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            {/* Contenedor con desplazamiento para las filas */}
            <div className="overflow-y-auto max-h-[320px] mt-4">
              <ul className="space-y-3">
                {detalleMovimiento
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((mov, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-lg">{mov.descripcion}</p>
                        <p className="text-sm text-gray-500">
                          Fecha: {formatFecha(mov.fecha)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Monto: {mov.monto.toFixed(2)} Soles
                        </p>
                        <p className="text-sm text-gray-500">
                          Responsable: {mov.responsable || "No asignado"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Categoría:{" "}
                          {categorias.find(
                            (categoria) => categoria.id === mov.categoriaId
                          )?.name || "Sin categoría"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        {mov.imageUrl ? (
                          <>
                            <a
                              href={mov.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              Ver Imagen
                            </a>
                            <button
                              onClick={() => {
                                if (mov.id && mov.movementUserId) {
                                  handleDelete(
                                    mov.id,
                                    mov.imageUrl,
                                    mov.movementUserId
                                  );
                                } else {
                                  console.error(
                                    "Movimiento no tiene un id válido o falta movementUserId"
                                  );
                                }
                              }}
                              className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                if (mov && mov.id) {
                                  openImageModal(mov);
                                } else {
                                  console.error(
                                    "Movimiento no válido para añadir imagen"
                                  );
                                }
                              }}
                              className="text-sm text-green-500 border border-green-500 px-3 py-1 rounded-md hover:bg-green-500 hover:text-white transition-colors"
                            >
                              Añadir Imagen
                            </button>

                            <button
                              onClick={() => {
                                if (mov.id && mov.movementUserId) {
                                  handleDelete(
                                    mov.id,
                                    mov.imageUrl,
                                    mov.movementUserId
                                  ); // Pasa también movementUserId
                                } else {
                                  console.error(
                                    "Movimiento no tiene un id válido o movementUserId"
                                  );
                                }
                              }}
                              className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Botón de cerrar */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cargar imagen */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-2xl font-semibold text-gray-700">
              Cargar Imagen
            </h3>
            <form onSubmit={handleImageUpload} className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700">
                  Selecciona una imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white rounded-lg"
                >
                  Subir Imagen
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

export default Reportes;
