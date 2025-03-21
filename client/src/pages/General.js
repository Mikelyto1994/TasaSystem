import React, { useState, useEffect } from "react";
import axios from "axios";

const General = () => {
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    scope: "misMovimientos",
    zona: "",
    ubicacion: "",
    equipo: "",
  });

  const [zonas, setZonas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [ots, setOts] = useState([]); // Estado para almacenar las órdenes de trabajo
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  // Obtener las zonas
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}varios/zonas`
        );
        setZonas(response.data);
      } catch (error) {
        console.error("Error al obtener zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  // Obtener las ubicaciones basadas en la zona seleccionada
  useEffect(() => {
    const fetchUbicaciones = async () => {
      const { zona } = filter;

      if (zona) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}varios/ubicaciones/por-zona?zonaId=${zona}`
          );
          setUbicaciones(response.data);
        } catch (error) {
          console.error("Error al obtener ubicaciones de la zona:", error);
        }
      } else {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}varios/ubicaciones`
          );
          setUbicaciones(response.data);
        } catch (error) {
          console.error("Error al obtener todas las ubicaciones:", error);
        }
      }
    };

    fetchUbicaciones();
  }, [filter.zona]);

  // Obtener los equipos basados en la zona y/o ubicación seleccionada
  useEffect(() => {
    const fetchEquipos = async () => {
      const { zona, ubicacion } = filter;

      if (zona) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}equipos/por-zona/${zona}`,
            {
              params: {
                ubicacionId: ubicacion || undefined,
              },
            }
          );
          setEquipos(response.data);
        } catch (error) {
          console.error("Error al obtener equipos de la zona:", error);
        }
      } else {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}equipos`
          );
          setEquipos(response.data);
        } catch (error) {
          console.error("Error al obtener todos los equipos:", error);
        }
      }
    };

    fetchEquipos();
  }, [filter.zona, filter.ubicacion]);

  // Manejar los cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  // Enviar el formulario (Buscar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Iniciar carga

    // Mostrar el request body en la consola
    console.log("Request Body:", {
      startDate: filter.startDate,
      endDate: filter.endDate,
      zona: filter.zona,
      ubicacion: filter.ubicacion,
      equipo: filter.equipo,
    });

    try {
      const response = await axios.get("https://vpd8hc-3001.csb.app/ots/search", {
        params: {
          startDate: filter.startDate,
          endDate: filter.endDate,
          zona: filter.zona,
          ubicacion: filter.ubicacion,
          equipo: filter.equipo,
        },
      });
      setOts(response.data); // Almacenar las órdenes de trabajo encontradas
    } catch (error) {
      console.error("Error al buscar órdenes de trabajo:", error);
    } finally {
      setLoading(false); // Finalizar carga
    }
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Filtrar Reportes
      </h1>

      {/* Formulario de filtrado */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 grid-cols-3 bg-gray-50 p-4 rounded-md shadow-md"
      >
        {/* Filtro desde */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Desde</label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro hasta */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Hasta</label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Filtro Por */}
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

        {/* Filtro Zona */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Zona</label>
          <select
            name="zona"
            value={filter.zona}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecciona una zona</option>
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Ubicación */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Ubicación</label>
          <select
            name="ubicacion"
            value={filter.ubicacion}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!filter.zona}
          >
            <option value="">Selecciona una ubicación</option>
            {ubicaciones
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.name}
                </option>
              ))}
          </select>
        </div>

        {/* Filtro Equipo */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Equipo</label>
          <select
            name="equipo"
            value={filter.equipo}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!filter.zona || !filter.ubicacion}
          >
            <option value="">Selecciona un equipo</option>
            {equipos
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.name}
                </option>
              ))}
          </select>
        </div>

        {/* Botón de Buscar */}
        <div className="col-span-3 flex justify-end items-center mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Mostrar resultados */}
      {loading && <p className="text-center mt-4">Cargando...</p>}
      {!loading && ots.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Órdenes de Trabajo Encontradas</h2>
          <ul className="list-disc pl-5">
            {ots.map((ot) => (
              <li key={ot.id}>
                <strong>OT ID:</strong> {ot.id} - <strong>Descripción:</strong> {ot.descripcionEquipo}
                <ul>
                  {ot.otConsumibles.map((consumible) => (
                    <li key={consumible.id}>
                      {consumible.nombreConsumible} - Cantidad: {consumible.cantidad}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loading && ots.length === 0 && <p className="text-center mt-4">No se encontraron órdenes de trabajo.</p>}
    </div>
  );
};

export default General;