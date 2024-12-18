import React, { useState } from "react";
import { createMovement } from "../services/api"; // Asegúrate que esta función haga la solicitud al backend
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Movimientos = () => {
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [image, setImage] = useState(null);

  // Obtener periodoInicio y periodoFin desde localStorage
  const periodoInicio = localStorage.getItem("periodoInicio");
  const periodoFin = localStorage.getItem("periodoFin");

  // Asegurarse de que los valores del periodo existan en localStorage
  const periodoValido = periodoInicio && periodoFin;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica si se han proporcionado los campos requeridos
    if (!tipoMovimiento || !descripcion || !monto || !fecha) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }

    // Convertir el monto a float antes de enviarlo al backend
    const montoFloat = parseFloat(monto);

    // Validación para asegurarse de que el monto sea un número válido
    if (isNaN(montoFloat)) {
      toast.error("El monto debe ser un número válido.");
      return;
    }

    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0"); // Ya no es necesario sumar 1
      const month = (d.getMonth() + 1).toString().padStart(2, "0"); // Los meses son 0-indexados, por eso sumamos 1
      const year = d.getFullYear();

      return `${day}-${month}-${year}`;
    };

    // Verificar si la fecha está dentro del rango permitido
    if (periodoValido) {
      const periodoInicio = localStorage.getItem("periodoInicio");
      const periodoFin = localStorage.getItem("periodoFin");

      const startDate = new Date(periodoInicio);
      const endDate = new Date(periodoFin);

      const selectedDate = new Date(fecha);

      if (selectedDate < startDate || selectedDate > endDate) {
        const formattedStartDate = formatDate(periodoInicio);
        const formattedEndDate = formatDate(periodoFin);

        toast.error(
          `La fecha está fuera de tu periodo: ${formattedStartDate} al ${formattedEndDate}`
        );
        return;
      }
    } else {
      toast.error("No se encontraron los datos del periodo.");
      return;
    }

    // Crear un objeto FormData para enviar datos de formulario, incluida la imagen
    const formData = new FormData();
    formData.append("tipoMovimiento", tipoMovimiento);
    formData.append("descripcion", descripcion);
    formData.append("monto", montoFloat);
    formData.append("fecha", fecha);

    // Si hay una imagen, añadirla al formulario
    if (image) {
      formData.append("image", image); // El nombre del campo de imagen debe coincidir con lo que espera el backend
    }

    try {
      // Intentar crear el movimiento enviando el FormData al backend
      await createMovement(formData);

      // Limpiar el formulario después de agregar el movimiento
      setTipoMovimiento("");
      setDescripcion("");
      setMonto("");
      setFecha("");
      setImage(null); // Limpiar imagen

      // Resetear el formulario (esto también limpiará el campo de la imagen)
      e.target.reset();

      toast.success("Movimiento registrado con éxito.");
    } catch (err) {
      toast.error("Error al registrar el movimiento.");
      console.error("Error al registrar movimiento:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        Registrar Movimiento
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="tipoMovimiento"
            className="block text-lg font-medium text-gray-700"
          >
            Tipo de Movimiento
          </label>
          <select
            id="tipoMovimiento"
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Seleccione Tipo de Movimiento</option>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block text-lg font-medium text-gray-700"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="4"
          />
        </div>

        <div>
          <label
            htmlFor="monto"
            className="block text-lg font-medium text-gray-700"
          >
            Monto
          </label>
          <input
            id="monto"
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="fecha"
            className="block text-lg font-medium text-gray-700"
          >
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-lg font-medium text-gray-700"
          >
            Cargar Imagen (opcional)
          </label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
        >
          Añadir Movimiento
        </button>
      </form>
      <ToastContainer /> {/* Añadimos el contenedor para mostrar los toasts */}
    </div>
  );
};

export default Movimientos;
