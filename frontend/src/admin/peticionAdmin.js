import { API_URL } from '../api.js'
import { cerrarSesion, obtenerSesion } from './sesion.js'

// fetch que ya lleva el pase (token) de la sesión y devuelve el JSON.
// Si algo falla lanza un Error con un mensaje listo para mostrar.
export async function peticionAdmin(ruta, opciones = {}) {
    const sesion = obtenerSesion()

    let respuesta
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            ...opciones,
            headers: { ...opciones.headers, Authorization: `Bearer ${sesion?.token}` },
        })
    } catch {
        throw new Error('No hay conexión con el servidor')
    }

    const datos = await respuesta.json().catch(() => ({}))

    // Pase vencido o inválido: cerramos la sesión y volvemos al login
    if (respuesta.status === 401) {
        cerrarSesion()
        window.location.href = '/admin/login'
        throw new Error('Tu sesión venció. Inicia sesión de nuevo.')
    }

    if (!respuesta.ok) throw new Error(datos.mensaje || 'Ocurrió un error inesperado')
    return datos
}