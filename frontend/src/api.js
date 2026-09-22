export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function urlImagen(ruta) {
    if (!ruta) return null;
    if (ruta.startsWith("/uploads/")) return API_URL.replace(/\/api\/?$/, "") + ruta;
    return ruta;
}