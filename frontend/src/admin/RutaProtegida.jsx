import { Navigate, Outlet } from "react-router-dom";
import { obtenerSesion } from "./sesion.js";

export default function RutaProtegida() {
    return obtenerSesion() ? <Outlet /> : <Navigate to="/admin/login" replace />;
}