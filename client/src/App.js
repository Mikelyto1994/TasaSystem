import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MovimientosPage from "./pages/Movimientos";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Reportes from "./components/Reportes";
import General from "./pages/General";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  // Usar useEffect para verificar si hay un usuario en el localStorage al cargar la app
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedToken = localStorage.getItem("token");

    if (storedUserName && storedToken) {
      setAuthenticated(true);
      setUserName(storedUserName);
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <div>
      <Header
        setAuthenticated={setAuthenticated}
        setUserName={setUserName}
        userName={userName}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/movimientos" />
            ) : (
              <Login
                setAuthenticated={setAuthenticated}
                setUserName={setUserName}
              />
            )
          }
        />
        <Route
          path="/movimientos"
          element={
            authenticated ? <MovimientosPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/reporte"
          element={authenticated ? <Reportes /> : <Navigate to="/login" />}
        />
        <Route
          path="/general"
          element={authenticated ? <General /> : <Navigate to="/login" />}
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
