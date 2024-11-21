import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios"; // Asegúrate de importar la instancia correctamente
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getMovements,
  updateMovementImage,
  deleteMovement,
} from "../services/api"; // Asegúrate de importar las funciones correspondientes
import Swal from "sweetalert2";

const General = () => {
  const [movements, setMovements] = useState([]);
  const navigate = useNavigate(); // useNavigate inicializado aquí
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [filter, setFilter] = useState({
    type: "", // 'ingreso' o 'egreso'
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const refreshReport = async () => {
    fetchMovements();
  };

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMovements(filter);
      console.log("Movimientos obtenidos:", response);

      // Aplicamos la lógica de filtrado por tipoMovimiento
      let filtered = [...response];
      if (filter.type) {
        filtered = filtered.filter(
          (movement) => movement.tipoMovimiento === filter.type
        );
      }

      setMovements(response);
      setFilteredMovements(filtered);
      console.log("Movimientos filtrados:", filtered);
    } catch (err) {
      setError("Error al cargar los movimientos");
      console.error("Error al cargar los movimientos:", err);
    } finally {
      setLoading(false);
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

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      await updateMovementImage(selectedMovement.id, formData);
      toast.success("Imagen cargada correctamente.");
      fetchMovements(); // Para obtener los movimientos actualizados
      setImageModalOpen(false);
      await refreshReport();
    } catch (err) {
      toast.error("Error al cargar la imagen.");
      console.error("Error al cargar la imagen:", err);
    }
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
      await deleteMovement(movementId);

      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl); // Función para eliminar imagen de Cloudinary
      }

      setMovements((prevMovements) =>
        prevMovements.filter((mov) => mov.id !== movementId)
      );

      Swal.fire(
        "¡Eliminado!",
        "El movimiento ha sido eliminado correctamente.",
        "success"
      );
      await refreshReport();
    } catch (err) {
      Swal.fire(
        "Error",
        "Hubo un problema al eliminar el movimiento.",
        "error"
      );
      console.error("Error al eliminar:", err);
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

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Reporte General
      </h1>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-3 bg-gray-50 p-4 rounded-md shadow-md"
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
        <div className="md:col-span-3 text-right">
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

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse bg-white border border-gray-300 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Fecha
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Tipo Movimiento
              </th>{" "}
              <th className="border border-gray-300 px-4 py-2 text-left">
                Descripción
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Monto
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Imagen
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Eliminar
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-4 text-gray-500 italic"
                >
                  No se encontraron movimientos.
                </td>
              </tr>
            ) : (
              filteredMovements
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar de más reciente a más antiguo
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
                    </td>{" "}
                    <td className="border border-gray-300 px-4 py-2">
                      {movement.descripcion}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {movement.monto}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {console.log("imageUrl:", movement.imageUrl)}{" "}
                      {/* Esto te ayudará a ver el valor de imageUrl */}
                      {movement.imageUrl ? (
                        <a
                          href={movement.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500"
                        >
                          Ver imagen
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenImageModal(movement)}
                          className="text-blue-500"
                        >
                          Añadir imagen
                        </button>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() =>
                          handleDelete(movement.id, movement.imageUrl)
                        }
                        className="text-red-500"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de imagen */}
      {imageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold">Subir Imagen</h3>
            <form onSubmit={handleImageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full p-2 mt-4 border border-gray-300 rounded-md"
              />
              <div className="mt-4 text-right">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

export default General;
