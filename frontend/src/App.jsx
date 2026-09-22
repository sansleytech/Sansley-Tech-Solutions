import { Routes, Route, Navigate } from "react-router-dom";
import Sitio from "./pages/Sitio.jsx";
import Login from "./pages/admin/Login.jsx";
import Resumen from "./pages/admin/Resumen.jsx";
import ProyectosAdmin from "./pages/admin/ProyectosAdmin.jsx";
import EquipoAdmin from "./pages/admin/EquipoAdmin.jsx";
import ServiciosAdmin from "./pages/admin/ServiciosAdmin.jsx";
import EmpresaAdmin from "./pages/admin/EmpresaAdmin.jsx";
import MensajesAdmin from "./pages/admin/MensajesAdmin.jsx";
import Cuenta from "./pages/admin/Cuenta.jsx";
import LayoutAdmin from "./admin/LayoutAdmin.jsx";
import RutaProtegida from "./admin/RutaProtegida.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Sitio />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Todo lo que esté aquí dentro exige haber iniciado sesión */}
      <Route element={<RutaProtegida />}>
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<Resumen />} />
          <Route path="proyectos" element={<ProyectosAdmin />} />
          <Route path="equipo" element={<EquipoAdmin />} />
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="empresa" element={<EmpresaAdmin />} />
          <Route path="mensajes" element={<MensajesAdmin />} />
          <Route path="cuenta" element={<Cuenta />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}