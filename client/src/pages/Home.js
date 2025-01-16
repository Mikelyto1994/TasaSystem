// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate(); // Hook para navegar programáticamente

  // Función que maneja el click en el botón
  const handleLoginRedirect = () => {
    navigate("/login"); // Redirige a la ruta '/login'
  };

  return (
    <div className="pt-12 pb-12 flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Bienvenid@ al módulo de registro de Ingresos/Egresos
        </h1>
        <p className="text-lg sm:text-xl max-w-xl mx-auto">
          Una plataforma intuitiva para gestionar los registros financieros de
          forma eficiente. Comienza a llevar la contabilidad por ti mismo o con
          un equipo :D
        </p>

        {/* Botón de login con transición y efecto hover */}
        <button
          onClick={handleLoginRedirect}
          className="mt-6 px-6 py-3 text-lg font-semibold bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 ease-in-out"
        >
          Ir al Login
        </button>
      </div>

      {/* Imagen decorativa en pantallas grandes */}
      <div className="hidden lg:block absolute bottom-0 right-0 z-[-1]">
        <img
          src="https://via.placeholder.com/400x400.png?text=Logo+de+Contabilidad"
          alt="Imagen de contabilidad"
          className="w-80 h-80 object-cover rounded-full shadow-lg"
        />
      </div>
    </div>
  );
};

export default Home;
