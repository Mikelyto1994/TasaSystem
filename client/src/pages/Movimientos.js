import React, { useState, useEffect, useRef } from "react";
import { createMovement, createOT, createOTConsumible } from "../services/api"; // Asegúrate de tener estas funciones en tu API
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash,FaPlus,FaUndo   } from "react-icons/fa";

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

  const [ots, setOts] = useState([]); // Estado para almacenar las OTs
  const [filteredOts, setFilteredOts] = useState([]); // OTs filtradas
  const [searchOt, setSearchOt] = useState(""); // Término de búsqueda para OTs
  const [openOtDropdown, setOpenOtDropdown] = useState(false); // Controlar la visibilidad del desplegable
  const [ubicacionId, setUbicacionId] = useState("");
  const otInputRef = useRef(null);
  // Función para manejar el cambio en el campo de búsqueda de OTs
  const handleOtChange = (e) => {
    setSearchOt(e.target.value);
    setOpenOtDropdown(true); // Abrir el desplegable al escribir
  };

  // Filtrar OTs en función del término de búsqueda
  useEffect(() => {
    const filtered = ots.filter((ot) =>
      ot.name.toLowerCase().includes(searchOt.toLowerCase())
    );
    setFilteredOts(filtered);
  }, [searchOt, ots]);

  // Función para seleccionar una OT
  const selectOt = (ot) => {
    setOtName(ot.name); // Establecer el nombre de la OT seleccionada
    setSearchOt(ot.name); // Establecer el valor del campo de búsqueda
    setOpenOtDropdown(false); // Cerrar el desplegable
    setOtId(ot.OTmaximo); // Almacenar el ID de la OT seleccionada
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpenOtDropdown(false); // Cerrar el desplegable
      setSearchOt(""); // Limpiar el campo de búsqueda
    }
  };
  // Manejar clics fuera del campo de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("otDropdown"); // ID del desplegable
      const input = document.getElementById("otName"); // ID del campo de búsqueda
      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        input &&
        !input.contains(event.target)
      ) {
        setOpenOtDropdown(false); // Cerrar el desplegable
        setSearchOt(""); // Limpiar el campo de búsqueda
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Estados para la OT
  const [otName, setOtName] = useState("");
  const [otValue, setOtValue] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [descripcionEquipo, setDescripcionEquipo] = useState("");
  const [ubicacionSinId, setUbicacionSinId] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);

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
  const [otId, setOtId] = useState(null);
  const [selectedConsumibles, setSelectedConsumibles] = useState([
    { name: "", unidadMedida: "", cantidad: 1, isEditing: false }, // Inicializa con una fila
  ]);
  const enableEditConsumible = (index) => {
    const newConsumibles = [...selectedConsumibles];
    newConsumibles[index].isEditing = true; // Cambia el estado de la fila a editable
    setSelectedConsumibles(newConsumibles);
  };
  const resetConsumible = (index) => {
    const newConsumibles = [...selectedConsumibles];
    newConsumibles[index].isEditing = false; // Cambia el estado de la fila a no editable
    setSelectedConsumibles(newConsumibles);
  };

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

  // Cargar OTs desde la API
  useEffect(() => {
    const fetchOTs = async () => {
      console.log("Fetching OTs...");

      // Imprimir los valores de zonaId y ubicacionId
      console.log("zonaId:", zonaId);
      console.log("ubicacionId:", ubicacionId);

      // Construir los parámetros de consulta
      const params = new URLSearchParams({ temp: "CHIV1" }); // Siempre incluir temp

      // Agregar zonaId si está definido
      if (zonaId) {
        params.append("zonaId", zonaId);
      }

      // Agregar ubicacionId si está definido
      if (ubicacionId) {
        params.append("ubicacionId", ubicacionId);
      }

      const url = `${
        process.env.REACT_APP_API_URL
      }ott/ots?${params.toString()}`;

      // Imprimir la URL completa que se está construyendo
      console.log("Request URL:", url); // Esto debería mostrar la URL construida

      try {
        const response = await axios.get(url); // Realizar la solicitud GET

        // Imprimir la respuesta del backend
        console.log("Response data:", response.data);

        setOts(response.data); // Guardamos las OTs en el estado
        setFilteredOts(response.data); // Inicialmente, mostramos todas las OTs
      } catch (error) {
        toast.error("Error al cargar las OTs.");
        console.error("Error al cargar OTs:", error);
      }
    };

    fetchOTs();
  }, [zonaId, ubicacionId]); // Dependencias del useEffect
  // Filtrar consumibles en función del término de búsqueda
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

// Filtrar consumibles disponibles para el desplegable
const availableConsumibles = filteredConsumibles.filter(
  (c) => !selectedConsumibles.some((selected) => selected.id === c.id)
);

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

    if (!otValue && !otId) {
      errorMessages.push("al menos un nombre OT o una OT no asignada");
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
        ottId: otId, // Usar el ID de la OT seleccionada
        OT: String(otValue),
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
      selectedConsumibles.length === 0 ||
      selectedConsumibles.some((c) => !c.name || !c.unidadMedida || !c.cantidad)
    ) {
      toast.error("Por favor, complete todos los campos de los consumibles.");
      setIsSubmittingConsumible(false);
      return;
    }
  
    try {
      for (const consumible of selectedConsumibles) {
        const otConsumibleData = {
          consumibleId: consumible.id || null, // Asegúrate de que el consumible tenga un ID
          nombreConsumible: consumible.name,
          unidadMedida: consumible.unidadMedida,
          cantidad: parseFloat(consumible.cantidad), // Asegúrate de que sea un número
          otId, // Asegúrate de tener el ID de la OT
          userId: localStorage.getItem("userId"), // Asegúrate de que sea un número
        };
  
        console.log("Datos a enviar:", otConsumibleData); // Para depuración
  
        const response = await createOTConsumible(otConsumibleData);
        console.log("Respuesta del servidor:", response); // Para depuración
      }
      toast.success("Consumibles registrados con éxito.");
      // Limpiar campos de consumible
      setSelectedConsumibles([{ name: "", unidadMedida: "", cantidad: 1 }]); // Reiniciar el estado
    } catch (err) {
      toast.error("Error al registrar los consumibles.");
      console.error("Error al registrar consumibles:", err);
    } finally {
      setIsSubmittingConsumible(false);
    }
  };

  const [newConsumible, setNewConsumible] = useState({
    name: "",
    unidadMedida: "",
    cantidad: 1,
  });
  const [isAddingNewConsumible, setIsAddingNewConsumible] = useState(false); // Estado para controlar la visibilidad del formulario de nuevo consumible

  // Función para manejar el cambio en el nuevo consumible
  const handleNewConsumibleChange = (e) => {
    const { name, value } = e.target;
    setNewConsumible((prev) => ({ ...prev, [name]: value }));
  };

  // Función para agregar el nuevo consumible a la lista
  const addNewConsumible = () => {
    if (!newConsumible.name || !newConsumible.unidadMedida || newConsumible.cantidad <= 0) {
      toast.error("Por favor, complete todos los campos del nuevo consumible.");
      return;
    }

    setSelectedConsumibles((prev) => [
      ...prev,
      { ...newConsumible, id: Date.now() }, // Usar un ID único temporal
    ]);
    setNewConsumible({ name: "", unidadMedida: "", cantidad: 1 }); // Reiniciar el formulario
    setIsAddingNewConsumible(false); // Cerrar el formulario
  };
  const handleNameChange = (index, value) => {
    const newConsumibles = [...selectedConsumibles];
    newConsumibles[index].name = value; // Actualiza el nombre del consumible
    setSelectedConsumibles(newConsumibles);
    setOpenDropdownIndex(index); // Abre el desplegable para este consumible
  };
  const [isReset, setIsReset] = useState(false);

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
          <div className="col-span-2">
            <label
              htmlFor="otName"
              className="block text-md font-medium text-gray-700"
            >
              Nombre OT
            </label>
            <input
              id="otName"
              type="text"
              value={searchOt} // Usar el término de búsqueda
              onChange={handleOtChange} // Manejar el cambio en el campo de búsqueda
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onFocus={() => setOpenOtDropdown(true)} // Abrir el desplegable al enfocar
            />
            {openOtDropdown && filteredOts.length > 0 && (
              <ul
                id="otDropdown" // ID del desplegable
                className="absolute left-0 w-full bg-white border border-gray-300 rounded-lg z-10"
              >
                {filteredOts.map((ot) => (
                  <li
                    key={ot.OTmaximo}
                    onClick={() => selectOt(ot)} // Seleccionar la OT al hacer clic
                    className="cursor-pointer hover:bg-gray-100 p-2"
                  >
                    {ot.name} {/* Mostrar el nombre de la OT */}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-span-2">
            <label
              htmlFor="otValue"
              className="block text-md font-medium text-gray-700"
            >
              OT no designada
            </label>
            <input
              id="otValue"
              type="text"
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
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
  <table className="min-w-full border-collapse border border-gray-300">
    <thead>
      <tr>
        <th className="border border-gray-300 p-2">#</th>
        <th className="border border-gray-300 p-2">Nombre del Consumible</th>
        <th className="border border-gray-300 p-2">UM</th>
        <th className="border border-gray-300 p-2">Cant.</th>
        <th className="border border-gray-300 p-2">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {selectedConsumibles.map((consumible, index) => (
        <tr key={index}>
          <td className="border border-gray-300 p-2">{index + 1}</td>
          <td className="border border-gray-300 p-2">
            {consumible.isEditing ? (
              <input
                type="text"
                placeholder="Coloca tu consumible"
                value={consumible.name}
                onChange={(e) => {
                  const newConsumibles = [...selectedConsumibles];
                  newConsumibles[index].name = e.target.value;
                  setSelectedConsumibles(newConsumibles);
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <input
                type="text"
                placeholder="Buscar consumible"
                value={consumible.name}
                onChange={(e) => {
                  const newConsumibles = [...selectedConsumibles];
                  newConsumibles[index].name = e.target.value;
                  setSelectedConsumibles(newConsumibles);
                  setOpenDropdownIndex(index);
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
            )}
            {consumible.isEditing ? (
              <></>
            ) : (
              <ul
  className={`absolute left-0 w-full bg-white border border-gray-300 rounded-lg z-10 ${
    openDropdownIndex === index ? "" : "hidden"
  }`}
>
  {availableConsumibles
    .filter((c) => {
      return (
        consumible.name &&
        c.name &&
        c.name.toLowerCase().includes(consumible.name.toLowerCase())
      );
    })
    .map((filteredConsumible) => (
      <li
        key={filteredConsumible.id}
        onClick={() => {
          const newConsumibles = [...selectedConsumibles];
          newConsumibles[index] = {
            ...filteredConsumible,
            cantidad: 1,
          };
          setSelectedConsumibles(newConsumibles);
          setOpenDropdownIndex(null);
        }}
        className="cursor-pointer hover:bg-gray-100 p-2"
      >
        {filteredConsumible.name}
      </li>
    ))}
</ul>)}
          </td>
          <td className="border border-gray-300 p-2">
            {consumible.isEditing ? (
              <input
                type="text"
                value={consumible.unidadMedida}
                onChange={(e) => {
                  const newConsumibles = [...selectedConsumibles];
                  newConsumibles[index].unidadMedida = e.target.value;
                  setSelectedConsumibles(newConsumibles);
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <span>{consumible.unidadMedida}</span>
            )}
          </td>
          <td className="border border-gray-300 p-2">
            <input
              type="number"
              min="1"
              value={consumible.cantidad}
              onChange={(e) => handleConsumibleChange(index, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </td>
          <td className="border border-gray-300 p-2 flex space-x-2">
            <button type="button" onClick={() => removeConsumible(index)}>
              <FaTrash className="text-red-500 hover:text-red-700" />
            </button>
            <button
              type="button"
              onClick={() => {
                consumible.isEditing = true;
                setSelectedConsumibles([...selectedConsumibles]);
              }}
            >
              <FaPlus className="text-green-500 hover:text-green-700" />
            </button>
            <button
              type="button"
              onClick={() => {
                consumible.isEditing = false;
                setSelectedConsumibles([...selectedConsumibles]);
              }}
            >
              <FaUndo className="text-blue-500 hover:text-blue-700" />
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
