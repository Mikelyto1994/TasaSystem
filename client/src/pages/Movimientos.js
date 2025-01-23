import React, { useState, useEffect } from "react";
import { createMovement } from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Movimientos = () => {
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [image, setImage] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(""); // Estado para la categoría seleccionada
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para deshabilitar el botón mientras se envía el formulario
  const [sinCategoriaId, setSinCategoriaId] = useState(""); // Nuevo estado para recordar "Sin categoría"

  // Obtener periodoInicio y periodoFin desde localStorage
  const periodoInicio = localStorage.getItem("periodoInicio");
  const periodoFin = localStorage.getItem("periodoFin");

  const periodoValido = periodoInicio && periodoFin;

  // Obtener las categorías desde la API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/categorias`
        );
        setCategorias(response.data);

        const sinCategoria = response.data.find(
          (c) => c.name === "Sin categoria"
        );
        if (sinCategoria) {
          setSinCategoriaId(sinCategoria.id);
          setCategoriaId(sinCategoria.id);
        }
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evitar el doble envío si ya se está enviando el formulario

    setIsSubmitting(true); // Deshabilitar el botón

    // Verifica si se han proporcionado los campos requeridos
    if (!tipoMovimiento || !descripcion || !monto || !fecha) {
      toast.error("Por favor, complete todos los campos.");
      setIsSubmitting(false); // Volver a habilitar el botón
      return;
    }

    // Convertir el monto a float antes de enviarlo al backend
    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat)) {
      toast.error("El monto debe ser un número válido.");
      setIsSubmitting(false);
      return;
    }

    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getUTCDate().toString().padStart(2, "0");
      const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    };

    // Verificar si la fecha está dentro del rango permitido
    if (periodoValido) {
      const startDate = new Date(periodoInicio);
      const endDate = new Date(periodoFin);
      const selectedDate = new Date(fecha);

      if (selectedDate < startDate || selectedDate > endDate) {
        const formattedStartDate = formatDate(periodoInicio);
        const formattedEndDate = formatDate(periodoFin);
        toast.error(
          `La fecha está fuera de tu periodo: ${formattedStartDate} al ${formattedEndDate}`
        );
        setIsSubmitting(false);
        return;
      }
    } else {
      toast.error("No se encontraron los datos del periodo.");
      setIsSubmitting(false);
      return;
    }

    // Crear un objeto FormData para enviar datos de formulario, incluida la imagen
    const formData = new FormData();
    formData.append("tipoMovimiento", tipoMovimiento);
    formData.append("descripcion", descripcion);
    formData.append("monto", montoFloat);
    formData.append("fecha", fecha);
    formData.append("categoriaId", parseInt(categoriaId, 10));

    if (image) {
      formData.append("image", image);
    }

    try {
      await createMovement(formData);
      toast.success("Movimiento registrado con éxito.");

      // Limpiar el formulario y restablecer la categoría a "Todas"
      setTipoMovimiento("");
      setDescripcion("");
      setMonto("");
      setFecha("");
      setImage(null);
      setCategoriaId(sinCategoriaId); // ✅ Restablecer a "Sin categoría"

      // Resetear el formulario
      e.target.reset();
    } catch (err) {
      toast.error("Error al registrar el movimiento.");
      console.error("Error al registrar movimiento:", err);
    } finally {
      setIsSubmitting(false); // Volver a habilitar el botón
    }
  };

  setTimeout(() => {
    setIsSubmitting(false);
  }, 2000);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8">
        Registrar Movimiento
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Tipo de Movimiento */}
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
        {/* Campo Categoría */}
        <div>
          <label
            htmlFor="categoria"
            className="block text-lg font-medium text-gray-700"
          >
            Categoría
          </label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>
        {/* Campo Descripción */}
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

        {/* Campo Monto */}
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

        {/* Campo Fecha */}
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

        {/* Campo Imagen */}
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

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
          disabled={isSubmitting} // Deshabilitar el botón mientras se está enviando
        >
          Añadir Movimiento
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Movimientos;
