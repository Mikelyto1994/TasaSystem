import React, { useState } from "react";
import axiosInstance from "../axios"; // Asegúrate de importar la instancia correctamente
import { toast } from "react-toastify";
import { getMovements, updateMovementImage } from "../services/api"; // Asegúrate que esta función haga la solicitud al backend
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const Reportes = () => {
  const [mes, setMes] = useState("");
  const [año, setAño] = useState("");
  const [ingresos, setIngresos] = useState(0);
  const [egresos, setEgresos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleMovimiento, setDetalleMovimiento] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false); // Para manejar el estado del modal de imagen
  const [selectedMovimiento, setSelectedMovimiento] = useState(null); // Para almacenar el movimiento seleccionado
  const [image, setImage] = useState(null); // Para manejar la imagen cargada
  const [modalKey, setModalKey] = useState(0); // Forzar re-render del modal

  const refreshReport = async () => {
    if (!mes || !año) {
      toast.error("Por favor, selecciona mes y año.");
      return;
    }

    // Crear la fecha de inicio en UTC para el mes seleccionado (primer día del mes)
    const startDate = new Date(Date.UTC(año, mes - 1, 1)); // Primer día del mes
    startDate.setHours(0, 0, 0, 0); // Aseguramos que la hora sea 00:00:00 en UTC

    // Crear la fecha de fin en UTC para el mes seleccionado
    let endDate;
    if (mes === 12) {
      // Si es diciembre, la fecha final debe ser el 31 de diciembre
      endDate = new Date(Date.UTC(año, mes - 1, 31)); // Último día de diciembre
    } else {
      // Para cualquier otro mes, usamos el último día natural del mes
      endDate = new Date(Date.UTC(año, mes, 0)); // Último día del mes
    }
    endDate.setHours(23, 59, 59, 999); // Aseguramos que la hora sea 23:59:59 en UTC

    // Convertimos las fechas a formato ISO para pasarlas al backend
    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();

    setLoading(true);

    try {
      const response = await getMovements({
        startDate: startDateString,
        endDate: endDateString,
      });

      const ingresosTotal = response
        .filter((mov) => mov.tipoMovimiento === "ingreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      const egresosTotal = response
        .filter((mov) => mov.tipoMovimiento === "egreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      setIngresos(ingresosTotal);
      setEgresos(egresosTotal);
      setMovimientos(response);
    } catch (err) {
      toast.error("Error al obtener los reportes.");
      console.error("Error al obtener los reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mes || !año) {
      toast.error("Por favor, selecciona mes y año.");
      return;
    }

    // Crear la fecha de inicio en UTC para el mes seleccionado (primer día del mes)
    const startDate = new Date(Date.UTC(año, mes - 1, 1)); // Primer día del mes
    startDate.setHours(0, 0, 0, 0); // Aseguramos que la hora sea 00:00:00 en UTC

    // Crear la fecha de fin en UTC para el mes seleccionado
    let endDate;
    if (mes === 12) {
      // Si es diciembre, la fecha final debe ser el 31 de diciembre
      endDate = new Date(Date.UTC(año, mes - 1, 31)); // Último día de diciembre
    } else {
      // Para cualquier otro mes, usamos el último día natural del mes
      endDate = new Date(Date.UTC(año, mes, 0)); // Último día del mes
    }
    endDate.setHours(23, 59, 59, 999); // Aseguramos que la hora sea 23:59:59 en UTC

    // Convertimos las fechas a formato ISO para pasarlas al backend
    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();

    setLoading(true);

    try {
      const response = await getMovements({
        startDate: startDateString,
        endDate: endDateString,
      });

      const ingresosTotal = response
        .filter((mov) => mov.tipoMovimiento === "ingreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      const egresosTotal = response
        .filter((mov) => mov.tipoMovimiento === "egreso")
        .reduce((sum, mov) => sum + mov.monto, 0);

      setIngresos(ingresosTotal);
      setEgresos(egresosTotal);
      setMovimientos(response);
    } catch (err) {
      toast.error("Error al obtener los reportes.");
      console.error("Error al obtener los reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal y mostrar los detalles
  const openModal = (tipo) => {
    setTipoMovimiento(tipo);
    const filteredMovements = movimientos.filter(
      (mov) => mov.tipoMovimiento === tipo
    );
    setDetalleMovimiento(filteredMovements);
    setModalOpen(true);
    setModalKey((prevKey) => prevKey + 1); // Forzar un cambio en la clave del modal
  };

  // Función para cerrar el modal de detalles
  const closeModal = () => {
    setModalOpen(false);
    setDetalleMovimiento([]);
    setModalKey((prevKey) => prevKey + 1); // Forzar un cambio en la clave para forzar el re-render
  };

  // Función para abrir el modal de carga de imagen
  const openImageModal = (movimiento) => {
    setSelectedMovimiento(movimiento); // Establecemos el movimiento seleccionado
    setImageModalOpen(true); // Abrimos el modal
  };

  // Función para cerrar el modal de carga de imagen
  const closeImageModal = () => {
    setImageModalOpen(false);
    setImage(null); // Limpiamos la imagen seleccionada
  };

  // Función para manejar la carga de la imagen
  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await updateMovementImage(
        selectedMovimiento.id,
        formData
      );
      toast.success("Imagen cargada correctamente.");

      // Llamamos a refreshReport para obtener los movimientos actualizados
      await refreshReport();

      // Cerrar los modales después de la carga exitosa
      closeImageModal();
      closeModal();
    } catch (err) {
      toast.error("Error al cargar la imagen.");
      console.error("Error al cargar la imagen:", err);
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", fecha);
      return "";
    }

    // Añadir un día a la fecha
    date.setDate(date.getDate() + 1);

    // Ahora formateas la fecha a un formato legible (por ejemplo: dd/mm/yyyy)
    return date.toLocaleDateString("es-PE"); // Formato de fecha en español para Perú
  };

  const handleDelete = async (movementId, imageUrl) => {
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
      // Eliminar el movimiento de la base de datos
      await deleteMovement(movementId);

      // Si hay una imagen asociada, eliminamos la imagen de Cloudinary
      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl);
      }

      // Actualizamos el estado para eliminar el movimiento del frontend
      setMovimientos((prevMovimientos) =>
        prevMovimientos.filter((mov) => mov.id !== movementId)
      );

      // Cerrar el modal después de la eliminación
      closeModal(); // Cierra el modal de detalles

      // Actualizar los ingresos y egresos llamando a refreshReport
      refreshReport(); // Esto actualizará los montos de ingresos y egresos

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

  // Función para eliminar la imagen de Cloudinary (solo se llama si hay una imagen)
  const deleteImageFromCloudinary = async (imageUrl) => {
    const publicId = extractPublicIdFromImageUrl(imageUrl);

    try {
      const response = await axiosInstance.delete("/api/delete-image", {
        data: { publicId }, // Usamos `data` para el cuerpo de la solicitud DELETE
      });

      if (response.status !== 200) {
        throw new Error("No se pudo eliminar la imagen de Cloudinary.");
      }
    } catch (err) {
      throw new Error("No se pudo eliminar la imagen de Cloudinary.");
    }
  };

  // Función para extraer el publicId de la URL de Cloudinary
  const extractPublicIdFromImageUrl = (imageUrl) => {
    const regex =
      /https:\/\/res.cloudinary.com\/[a-z0-9]+\/image\/upload\/v[0-9]+\/(.+)\.(jpg|png|jpeg)/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null; // Devuelve el publicId
  };

  // Función para eliminar el movimiento de la base de datos
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

        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
        >
          Obtener Reporte
        </button>
      </form>

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
          key={modalKey} // Forzar un cambio en la clave del modal
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-2xl font-semibold text-gray-700">
              Detalles de{" "}
              {tipoMovimiento === "ingreso" ? "Ingresos" : "Egresos"}
            </h3>

            <ul className="mt-4 space-y-3">
              {detalleMovimiento
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar de más reciente a más antiguo
                .map((mov, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-lg">{mov.descripcion}</p>
                      <p className="text-sm text-gray-500">
                        Fecha: {formatFecha(mov.fecha)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Monto: {mov.monto.toFixed(2)} Soles
                      </p>
                    </div>

                    {/* Botón de Eliminar siempre visible, incluso si no hay imagen */}
                    <div className="flex items-center space-x-4">
                      {mov.imageUrl ? (
                        <>
                          {/* Si hay una imagen, muestra el botón "Ver Imagen" */}
                          <a
                            href={mov.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 border border-blue-500 px-3 py-1 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            Ver Imagen
                          </a>
                          <button
                            onClick={() => handleDelete(mov.id, mov.imageUrl)}
                            className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Si no hay imagen, muestra el botón para cargar una nueva imagen */}
                          <button
                            onClick={() => openImageModal(mov)} // Aquí abrimos el modal para añadir imagen
                            className="text-sm text-green-500 border border-green-500 px-3 py-1 rounded-md hover:bg-green-500 hover:text-white transition-colors"
                          >
                            Añadir Imagen
                          </button>
                          <button
                            onClick={() => handleDelete(mov.id)} // Elimina el movimiento si no hay imagen
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

            <button
              onClick={closeModal}
              className="mt-4 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cerrar
            </button>
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
                  Selecciona una Imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-orange-500 text-white rounded-lg"
              >
                Subir Imagen
              </button>
            </form>
            <button
              onClick={closeImageModal}
              className="mt-4 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Reportes;
