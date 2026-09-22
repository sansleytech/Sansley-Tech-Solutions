import { useEffect, useState } from "react";
import { API_URL } from "../api.js";

export default function useDatos(ruta) {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}${ruta}`)
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error("Respuesta no válida");
                return respuesta.json();
            })
            .then(setDatos)
            .catch(() => setError(true))
            .finally(() => setCargando(false));
    }, [ruta]);

    return { datos, cargando, error };
}
