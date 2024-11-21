// src/components/MovimientosTable.js
import React, { useEffect, useState } from "react";
import axios from "../axios";

const MovimientosTable = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await axios.get("/movimientos", {
          params: {
            tipoMovimiento,
            startDate,
            endDate,
          },
        });
        setMovimientos(response.data);
      } catch (error) {
        console.error("Error al obtener los movimientos:", error);
      }
    };

    fetchMovimientos();
  }, [tipoMovimiento, startDate, endDate]);

  return (
    <div>
      <h2>Movimientos</h2>

      <label>
        Filtrar por tipo:
        <select
          value={tipoMovimiento}
          onChange={(e) => setTipoMovimiento(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </select>
      </label>
      <br />

      <label>
        Fecha inicio:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <label>
        Fecha fin:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>
      <br />

      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Imagen</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id}>
              <td>{new Date(movimiento.fecha).toLocaleDateString()}</td>
              <td>{movimiento.descripcion}</td>
              <td>{movimiento.monto}</td>
              <td>
                {movimiento.imageUrl && (
                  <a
                    href={movimiento.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver imagen
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovimientosTable;
