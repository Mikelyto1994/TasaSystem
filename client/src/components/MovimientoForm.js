import React, { useState } from "react";
import axios from "../axios";

const MovimientoForm = () => {
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      alert("Solo se permiten imágenes JPEG o PNG.");
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!tipoMovimiento || !descripcion || !monto || !fecha) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    setError(""); // Limpia errores previos
    setMessage(""); // Limpia mensajes previos
    setLoading(true);

    const formData = new FormData();
    formData.append("tipoMovimiento", tipoMovimiento);
    formData.append("descripcion", descripcion);
    formData.append("monto", monto);
    formData.append("fecha", fecha);
    if (image) formData.append("image", image);

    try {
      await axios.post("/movimiento", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Movimiento registrado con éxito");
      setTipoMovimiento("");
      setDescripcion("");
      setMonto("");
      setFecha("");
      setImage(null);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      setError("Error al registrar movimiento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Registrar Movimiento</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Tipo de Movimiento:
            <select
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Descripción:
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Monto:
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Fecha:
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Imagen o Sustento:
            <input type="file" onChange={handleFileChange} />
          </label>
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Registrar Movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovimientoForm;
