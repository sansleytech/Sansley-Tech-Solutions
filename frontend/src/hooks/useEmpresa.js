import { useEffect, useState } from "react";
import { API_URL } from "../api.js";

// La petición se guarda aquí para que Nosotros, Footer, Contacto y el botón
// de WhatsApp compartan UNA sola llamada al servidor
let peticion = null;

function pedirEmpresa() {
    if (!peticion) {
        peticion = fetch(`${API_URL}/empresa`)
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error("Respuesta no válida");
                return respuesta.json();
            })
            .catch((error) => {
                peticion = null; // si falló, la próxima vez se vuelve a intentar
                throw error;
            });
    }
    return peticion; // siempre devuelve la petición (nueva o la que ya existía)
}

export default function useEmpresa() {
    const [empresa, setEmpresa] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let activo = true; // evita actualizar un componente que ya se desmontó

        pedirEmpresa()
            .then((datos) => activo && setEmpresa(datos))
            .catch(() => activo && setError(true))
            .finally(() => activo && setCargando(false));

        return () => {
            activo = false;
        };
    }, []);

    return { empresa, cargando, error };
}