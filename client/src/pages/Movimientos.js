import React, { useState, useEffect } from "react";
import { createMovement, createOT, createOTConsumible } from "../services/api"; // Asegúrate de tener estas funciones en tu API
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";

const Movimientos = () => {
  // Estados para las zonas
  const [zonas, setZonas] = useState([]);
  const [zonaId, setZonaId] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para almacenar el término de búsqueda
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar la visibilidad del desplegable
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // Cargar zonas desde la API
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}varios/zonas`
        );

        setZonas(response.data); // Guardamos las zonas en el estado
      } catch (error) {
        toast.error("Error al cargar las zonas.");
        console.error("Error al cargar zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  // Filtrar las zonas basadas en el término de búsqueda
  const filteredZonas = zonas.filter((zona) =>
    zona.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Estados para la OT
  const [otName, setOtName] = useState("");
  const [otValue, setOtValue] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [descripcionEquipo, setDescripcionEquipo] = useState("");
  const [ubicacionSinId, setUbicacionSinId] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);
  const [ubicacionId, setUbicacionId] = useState("");
  useEffect(() => {
    const fetchUbicacionesPorZona = async () => {
      if (!zonaId) return; // Si no hay zonaId, no hacer la solicitud

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}varios/ubicaciones/por-zona?zonaId=${zonaId}`
        );
        setUbicaciones(response.data); // Guardamos las ubicaciones en el estado
      } catch (error) {
        toast.error("Error al cargar las ubicaciones de esta zona.");
        console.error("Error al cargar ubicaciones por zona:", error);
      }
    };

    fetchUbicacionesPorZona();
  }, [zonaId]);

  // Estados para los consumibles
  const [consumibles, setConsumibles] = useState([]); // Todos los consumibles disponibles
  const [filteredConsumibles, setFilteredConsumibles] = useState([]); // Consumibles filtrados
  const [searchConsumible, setSearchConsumible] = useState(""); // Término de búsqueda
  const [selectedConsumibles, setSelectedConsumibles] = useState([]); // Consumibles seleccionados

  // Cargar consumibles desde la API
  useEffect(() => {
    const fetchConsumibles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}consumibles`
        );
        setConsumibles(response.data); // Guardamos todos los consumibles en el estado
        setFilteredConsumibles(response.data); // Inicialmente, mostramos todos los consumibles
      } catch (error) {
        toast.error("Error al cargar los consumibles.");
        console.error("Error al cargar consumibles:", error);
      }
    };

    fetchConsumibles();
  }, []);

  // Filtrar consumibles en función del término de búsqueda
  useEffect(() => {
    const filtered = consumibles.filter((consumible) =>
      consumible.name.toLowerCase().includes(searchConsumible.toLowerCase())
    );
    setFilteredConsumibles(filtered);
  }, [searchConsumible, consumibles]);

  // Función para agregar un consumible seleccionado
  const addConsumible = (consumible) => {
    setSelectedConsumibles([
      ...selectedConsumibles,
      { ...consumible, cantidad: 1 },
    ]); // Agregar el consumible seleccionado con cantidad inicial de 1
    setSearchConsumible(""); // Limpiar el campo de búsqueda
  };

  // Función para manejar el cambio en la cantidad de un consumible
  const handleConsumibleChange = (index, value) => {
    const newConsumibles = [...selectedConsumibles];
    newConsumibles[index].cantidad = value; // Actualizar la cantidad
    setSelectedConsumibles(newConsumibles);
  };

  // Función para eliminar un consumible
  const removeConsumible = (index) => {
    const newConsumibles = selectedConsumibles.filter((_, i) => i !== index);
    setSelectedConsumibles(newConsumibles);
  };
  const [equipos, setEquipos] = useState([]);
  const [searchTermEquipo, setSearchTermEquipo] = useState("");
  const [isDropdownOpenEquipo, setIsDropdownOpenEquipo] = useState(false);
  useEffect(() => {
    const fetchEquipos = async () => {
      if (!zonaId) return; // Si no hay zonaId, no hacer la solicitud

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}equipos/por-zona/${zonaId}`, // Nueva ruta para obtener equipos por zona
          {
            params: {
              ubicacionId: ubicacionId || undefined, // Pasar ubicacionId como parámetro de consulta
            },
          }
        );
        setEquipos(response.data); // Guardamos los equipos en el estado
      } catch (error) {
        toast.error("Error al cargar los equipos de esta zona.");
        console.error("Error al cargar equipos:", error);
      }
    };

    fetchEquipos();
  }, [zonaId, ubicacionId]); // Dependencias actualizadas
  const filteredEquipos = equipos.filter((equipo) =>
    equipo.name.toLowerCase().includes(searchTermEquipo.toLowerCase())
  );

  const [isSubmittingOT, setIsSubmittingOT] = useState(false);
  const [isSubmittingConsumible, setIsSubmittingConsumible] = useState(false);

  // Función para manejar el envío de la OT
  const handleSubmitOT = async (e) => {
    e.preventDefault();
    if (isSubmittingOT) return;

    setIsSubmittingOT(true);

    // Acumular mensajes de error
    const errorMessages = [];

    // Validación de campos
    if (!zonaId) {
      errorMessages.push("Zona");
    }

    if (!ubicacionId && !ubicacionSinId) {
      errorMessages.push("al menos uno de Ubicación o Ubicación Sin");
    }

    if (!otValue && !otName) {
      errorMessages.push("al menos uno de Valor de OT o Nombre de OT");
    }

    if (!equipoId && !descripcionEquipo) {
      errorMessages.push(
        "al menos uno de los campos ID del Equipo o Descripción del Equipo"
      );
    }

    // Validar que al menos un consumible esté seleccionado y tenga un nombre
    if (
      selectedConsumibles.length === 0 ||
      selectedConsumibles.every((c) => !c.name)
    ) {
      errorMessages.push(
        "Debes seleccionar al menos un consumible con un nombre válido."
      );
    }

    // Si hay mensajes de error, mostrar alerta y salir
    if (errorMessages.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Por favor, complete el campo: ${errorMessages.join(", ")}.`, // Unir todos los mensajes en una sola cadena
      });
      setIsSubmittingOT(false);
      return;
    }

    try {
      const otData = {
        name: otName,
        OT: parseFloat(otValue),
        equipoId: parseInt(equipoId, 10),
        descripcionEquipo,
        zonaId: parseInt(zonaId, 10),
        ubicacionId: parseInt(ubicacionId, 10),
        ubicacionSinId,
        userId: localStorage.getItem("userId"), // Asumiendo que el ID del usuario está en localStorage
      };

      // Log del cuerpo de la solicitud de OT
      console.log("Cuerpo de la solicitud de OT:", otData);

      // Enviar la OT al backend con el token de autorización
      const token = localStorage.getItem("token"); // Obtener el token del localStorage
      const createdOT = await createOT(otData, token); // Pasar el token a la función createOT
      console.log("OT creada:", createdOT); // Para depuración

      // Enviar cada consumible asociado a la OT
      for (const consumible of selectedConsumibles) {
        const otConsumibleData = {
          consumibleId: consumible.id, // Asegúrate de que el consumible tenga un ID
          nombreConsumible: consumible.name,
          unidadMedida: consumible.unidadMedida,
          cantidad: consumible.cantidad,
          otId: createdOT.id, // Usar el ID de la OT creada
          userId: localStorage.getItem("userId"),
          // Puedes agregar otros campos si es necesario
        };

        // Log del cuerpo de la solicitud de OTConsumible
        console.log(
          "Cuerpo de la solicitud de OTConsumible:",
          otConsumibleData
        );

        await createOTConsumible(otConsumibleData, token); // Pasar el token a la función createOTConsumible
      }

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "OT y consumibles registrados con éxito.",
      });

      // Limpiar campos de OT
      setOtName("");
      setOtValue("");
      setEquipoId("");
      setDescripcionEquipo("");
      setZonaId("");
      setUbicacionId("");
      setUbicacionSinId("");
      setSelectedConsumibles([]); // Limpiar consumibles seleccionados
    } catch (err) {
      console.error("Error al registrar OT o consumibles:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al registrar la OT o los consumibles.",
      });
    } finally {
      setIsSubmittingOT(false);
    }
  };
  // Función para manejar el envío de consumibles
  const handleSubmitConsumible = async (e) => {
    e.preventDefault();
    if (isSubmittingConsumible) return;

    setIsSubmittingConsumible(true);

    // Validar que al menos un consumible tenga datos
    if (
      consumibles.length === 0 ||
      consumibles.some((c) => !c.nombre || !c.unidadMedida || !c.cantidad)
    ) {
      toast.error("Por favor, complete todos los campos de los consumibles.");
      setIsSubmittingConsumible(false);
      return;
    }

    try {
      for (const consumible of consumibles) {
        const consumibleData = {
          nombreConsumible: consumible.nombre,
          unidadMedida: consumible.unidadMedida,
          cantidad: parseFloat(consumible.cantidad),
          otId, // Asegúrate de tener el ID de la OT
          userId: localStorage.getItem("userId"),
        };

        await createOTConsumible(consumibleData);
      }
      toast.success("Consumibles registrados con éxito.");
      // Limpiar campos de consumible
      setConsumibles([{ nombre: "", unidadMedida: "", cantidad: "" }]);
    } catch (err) {
      toast.error("Error al registrar los consumibles.");
      console.error("Error al registrar consumibles:", err);
    } finally {
      setIsSubmittingConsumible(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 mb-10">
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
        Registrar Orden de Trabajo (OT)
      </h2>
      <form onSubmit={handleSubmitOT} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="zonaId"
              className="block text-md font-medium text-gray-700"
            >
              Zona
            </label>
            <select
              id="zonaId"
              value={zonaId}
              onChange={(e) => setZonaId(e.target.value)} // Actualiza el estado con el ID de la zona seleccionada
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="" disabled>
                Seleccionar zona
              </option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.name} {/* Muestra el nombre de la zona */}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ubicacionId"
              className="block text-md font-medium text-gray-700"
            >
              Ubicación
            </label>
            <select
              id="ubicacionId"
              value={ubicacionId}
              onChange={(e) => setUbicacionId(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }} // Controla la altura máxima del desplegable
            >
              <option value="" disabled>
                Seleccionar ubicación
              </option>
              <option value="">Sin ubicación</option>
              {ubicaciones
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((ubicacion) => (
                  <option key={ubicacion.id} value={ubicacion.id}>
                    {ubicacion.name} - {ubicacion.zona.name}{" "}
                    {/* Muestra el nombre de la ubicación y la zona */}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ubicacionSinId"
              className="block text-md font-medium text-gray-700"
            >
              Sin Ubicación
            </label>
            <input
              id="ubicacionSinId"
              type="text"
              value={ubicacionSinId}
              onChange={(e) => setUbicacionSinId(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3">
            <label
              htmlFor="otName"
              className="block text-md font-medium text-gray-700"
            >
              Nombre OT
            </label>
            <input
              id="otName"
              type="text"
              value={otName}
              onChange={(e) => setOtName(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="col-span-1">
            <label
              htmlFor="otValue"
              className="block text-md font-medium text-gray-700"
            >
              Valor de OT
            </label>
            <input
              id="otValue"
              type="number"
              value={otValue}
              onChange={(e) => setOtValue(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="equipoId"
              className="block text-md font-medium text-gray-700"
            >
              Equipo
            </label>
            <select
              id="equipoId"
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)} // Actualiza el estado con el ID del equipo seleccionado
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Sin seleccionar</option>{" "}
              {/* Opción "Sin seleccionar" con valor "NA" */}
              {equipos
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.name} {/* Muestra el nombre del equipo */}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="descripcionEquipo"
            className="block text-lg font-medium text-gray-700"
          >
            Descripción del Equipo sin ID
          </label>
          <textarea
            id="descripcionEquipo"
            value={descripcionEquipo}
            onChange={(e) => setDescripcionEquipo(e.target.value)}
            className="h-10 w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="2"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
          disabled={isSubmittingOT}
        >
          Añadir OT
        </button>
      </form>

      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-8 mt-10">
        Adicionar Consumibles
      </h2>
      <form onSubmit={handleSubmitConsumible} className="space-y-6">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">#</th>
              <th className="border border-gray-300 p-2">
                Nombre del Consumible
              </th>
              <th className="border border-gray-300 p-2">UM</th>
              <th className="border border-gray-300 p-2">Cant.</th>
              <th className="border border-gray-300 p-2">Dlt</th>
            </tr>
          </thead>
          <tbody>
            {selectedConsumibles.map((consumible, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="text"
                    placeholder="Buscar consumible..."
                    value={consumible.name} // Mantener el nombre seleccionado
                    onChange={(e) => {
                      const newConsumibles = [...selectedConsumibles];
                      newConsumibles[index].name = e.target.value; // Actualiza el nombre del consumible
                      setSelectedConsumibles(newConsumibles);
                      setOpenDropdownIndex(index); // Abre el desplegable para este consumible
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <ul
                    className={`absolute left-0 w-full bg-white border border-gray-300 rounded-lg z-10 ${
                      openDropdownIndex === index ? "" : "hidden" // Solo mostrar si el índice coincide
                    }`}
                  >
                    {filteredConsumibles
                      .filter(
                        (c) =>
                          consumible.name &&
                          c.name
                            .toLowerCase()
                            .includes(consumible.name.toLowerCase())
                      ) // Verifica que consumible.name esté definido
                      .filter(
                        (c) =>
                          !selectedConsumibles.some((sc) => sc.name === c.name)
                      ) // Filtra consumibles ya seleccionados
                      .map((filteredConsumible) => (
                        <li
                          key={filteredConsumible.id}
                          onClick={() => {
                            const newConsumibles = [...selectedConsumibles];
                            newConsumibles[index] = {
                              ...filteredConsumible,
                              cantidad: 1, // Establecer cantidad inicial
                            };
                            setSelectedConsumibles(newConsumibles);
                            setOpenDropdownIndex(null); // Cierra el desplegable al seleccionar
                            console.log(
                              "Consumible seleccionado:",
                              filteredConsumible
                            ); // Para depuración
                          }}
                          className="cursor-pointer hover:bg-gray-100 p-2"
                        >
                          {filteredConsumible.name}
                        </li>
                      ))}
                  </ul>
                </td>
                <td className="border border-gray-300 p-2">
                  {consumible.unidadMedida}{" "}
                  {/* Mostrar la unidad de medida como texto */}
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    min="1" // Asegura que la cantidad sea al menos 1
                    value={consumible.cantidad} // Mantener la cantidad
                    onChange={
                      (e) => handleConsumibleChange(index, e.target.value) // Manejar el cambio en la cantidad
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <button type="button" onClick={() => removeConsumible(index)}>
                    <FaTrash className="text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addConsumible}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          Añadir Consumible
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Movimientos;
