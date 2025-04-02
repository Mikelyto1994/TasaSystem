import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado

const Reportes = () => {
  const [componentes, setComponentes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    zonaId: '',
    ubicacionId: '',
    equipoId: '',
  });
  const [zonas, setZonas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [editingAtributo, setEditingAtributo] = useState(null); // Para manejar la edición
  const [newAtributo, setNewAtributo] = useState({ nombre: '', valor: '' }); // Para el nuevo atributo

  // Cargar componentes desde la API
  useEffect(() => {
    const fetchComponentes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}componentes`);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
        }
        const data = await response.json();
        setComponentes(data);
        setFilteredData(data); // Inicialmente, mostrar todos los componentes
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComponentes();
  }, []);

  // Cargar zonas desde la API
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}varios/zonas`);
        setZonas(response.data); // Guardamos las zonas en el estado
      } catch (error) {
        setError("Error al cargar las zonas.");
        console.error("Error al cargar zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  // Cargar ubicaciones basadas en la zona seleccionada
  useEffect(() => {
    const fetchUbicacionesPorZona = async () => {
      if (!filters.zonaId) return; // Si no hay zonaId, no hacer la solicitud

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}varios/ubicaciones/por-zona?zonaId=${filters.zonaId}`);
        setUbicaciones(response.data); // Guardamos las ubicaciones en el estado
      } catch (error) {
        setError("Error al cargar las ubicaciones de esta zona.");
        console.error("Error al cargar ubicaciones por zona:", error);
      }
    };

    fetchUbicacionesPorZona();
  }, [filters.zonaId]);

  // Cargar equipos basados en la zona y ubicación seleccionadas
  useEffect(() => {
    const fetchEquipos = async () => {
      if (!filters.zonaId) return; // Si no hay zonaId, no hacer la solicitud

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}equipos/por-zona/${filters.zonaId}`,
          {
            params: {
              ubicacionId: filters.ubicacionId || undefined, // Pasar ubicacionId como parámetro de consulta
            },
          }
        );
        setEquipos(response.data); // Guardamos los equipos en el estado
      } catch (error) {
        setError("Error al cargar los equipos de esta zona.");
        console.error("Error al cargar equipos:", error);
      }
    };

    fetchEquipos();
  }, [filters.zonaId, filters.ubicacionId]); // Dependencias actualizadas

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const { zonaId, ubicacionId, equipoId } = filters;
    const filtered = componentes.filter((componente) => {
      return (
        (zonaId ? componente.equipo.zonaId === parseInt(zonaId) : true) &&
        (ubicacionId ? componente .equipo.ubicacionId === parseInt(ubicacionId) : true) &&
        (equipoId ? componente.equipo.id === parseInt(equipoId) : true) // Filtrar por ID de equipo
      );
    });
    setFilteredData(filtered);
  };

  const handleEditClick = (atributo) => {
    setEditingAtributo(atributo);
    setNewAtributo({ nombre: atributo.nombre, valor: atributo.valor }); // Prellenar los nuevos valores
  };

  const handleUpdateAtributo = async (atributoId) => {
    const userId = parseInt(localStorage.getItem('userId'),10); // Obtener el userId del localStorage
    const token = localStorage.getItem('token'); // Obtener el token del localStorage
  
    // Agregar un console.log para ver el cuerpo de la solicitud
    console.log("Cuerpo de la solicitud:", {
      nombre: newAtributo.nombre,
      valor: newAtributo.valor,
      userId: userId,
    });
  
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}atributos/${atributoId}`, {
        nombre: newAtributo.nombre,
        valor: newAtributo.valor,
        userId: userId, // Enviar el userId
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token en los headers
        },
      });
  
      // Actualizar la lista de atributos
      setFilteredData((prevData) => 
        prevData.map((item) => ({
          ...item,
          atributos: item.atributos.map((attr) => 
            attr.id === atributoId ? { ...attr, nombre: response.data.nombre, valor: response.data.valor } : attr
          ),
        }))
      );
  
      setEditingAtributo(null); // Limpiar el estado de edición
      setNewAtributo({ nombre: '', valor: '' }); // Limpiar los nuevos valores
    } catch (error) {
      console.error("Error al actualizar el atributo:", error);
      setError("Error al actualizar el atributo.");
    }
  };

  const handleCancelEdit = () => {
    setEditingAtributo(null); // Limpiar el estado de edición
    setNewAtributo({ nombre: '', valor: '' }); // Limpiar los nuevos valores
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Filtrar Componentes</h2> 
      <div className="flex items-center mb-4 space-x-2">
        <select
          name="zonaId"
          value={filters.zonaId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-1/4"
        >
          <option value="" disabled>Seleccionar zona</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.name}
            </option>
          ))}
        </select>

        <select
          name="ubicacionId"
          value={filters.ubicacionId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-1/4"
          disabled={!filters.zonaId}
        >
          <option value="" disabled>Seleccionar ubicación</option>
          {ubicaciones.map((ubicacion) => (
            <option key={ubicacion.id} value={ubicacion.id}>
              {ubicacion.name}
            </option>
          ))}
        </select>

        <select
          name="equipoId"
          value={filters.equipoId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-1/4"
          disabled={!filters.ubicacionId}
        >
          <option value="" disabled>Seleccionar equipo</option>
          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.name}
            </option>
          ))}
        </select>

        <button onClick={applyFilters} className="bg-blue-500 text-white p-2 rounded w-1/4">
          Filtrar
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Resultados</h2>
      <table className="min-w-full border border-collapse">
        <thead>
          <tr>
            <th className="border w-1/24">N°</th>
            <th className="border w-5/12">Descripción del equipo</th>
            <th className="border w-2/12">Componente</th>
            <th className="border w-1/12">Atributo</th>
            <th className="border w-1/12">Valor</th>
            <th className="border w-2/12">Acciones</th> {/* Nueva columna de acciones */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) =>
            item.atributos.map((atributo) => (
              <tr key={atributo.id}>
                <td className="border text-center">{index + 1}</td>
                <td className="border text-center">{item.equipo.name}</td>
                <td className="border text-center">{item.parteEquipo}</td>
                <td className="border text-center">
                  {editingAtributo && editingAtributo.id === atributo.id ? (
                    <input
                      type="text"
                      value={newAtributo.nombre}
                      onChange={(e) => setNewAtributo({ ...newAtributo, nombre: e.target.value })}
                      className="border p-1 rounded"
                    />
                  ) : (
                    atributo.nombre
                  )}
                </td>
                <td className="border text-center">
                  {editingAtributo && editingAtributo.id === atributo.id ? (
                    <input
                      type="text"
                      value={newAtributo.valor}
                      onChange={(e) => setNewAtributo({ ...newAtributo, valor: e.target.value })}
                      className="border p-1 rounded"
                    />
                  ) : (
                    atributo.valor
                  )}
                </td>
                <td className="border text-center">
                  {editingAtributo && editingAtributo.id === atributo.id ? (
                    <>
                      <button onClick={() => handleUpdateAtributo(atributo.id)} className="text-green-500">
                        Guardar
                      </button>
                      <button onClick={handleCancelEdit} className="text-red-500 ml-2">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <FaEdit onClick={() => handleEditClick(atributo)} className="inline cursor-pointer" />
                      <span className="ml-2 cursor-pointer text-blue-500">Ver imagen</span>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Reportes;