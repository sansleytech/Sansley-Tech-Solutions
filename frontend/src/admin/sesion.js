const CLAVE = "sansley_sesion";

export function guardarSesion(token, usuario) {
    localStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE);
}

// Devuelve { token, usuario } si hay una sesión vigente, o null
export function obtenerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE));
        if (!sesion?.token) return null;

        // El token trae su fecha de vencimiento (exp, en segundos) dentro del cuerpo
        const base64 = sesion.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const { exp } = JSON.parse(atob(base64));
        if (exp * 1000 < Date.now()) {
            cerrarSesion();
            return null;
        }
        return sesion;
    } catch {
        return null;
    }
}