import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { API_URL } from "../../api.js";
import { guardarSesion, obtenerSesion } from "../../admin/sesion.js";
import logoHorizontal from "../../assets/sansleyHorizontal.png";

export default function Login() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [verClave, setVerClave] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    // Si ya hay sesión, no tiene sentido mostrar el login
    if (obtenerSesion()) return <Navigate to="/admin" replace />;

    async function enviar(evento) {
        evento.preventDefault();
        setError("");
        setEnviando(true);

        try {
            const respuesta = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena }),
            });
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "No se pudo iniciar sesión");
            }

            guardarSesion(datos.token, datos.usuario);
            navigate("/admin", { replace: true });
        } catch (e) {
            setError(
                e.message === "Failed to fetch"
                    ? "No hay conexión con el servidor"
                    : e.message
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "marino.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Card
                component="form"
                onSubmit={enviar}
                sx={{ width: "100%", maxWidth: 400, p: { xs: 3, sm: 4 } }}
            >
                <Box
                    component="img"
                    src={logoHorizontal}
                    alt="Sansley Tech Solutions"
                    sx={{ height: 48, display: "block", mx: "auto", mb: 3 }}
                />

                <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
                    Panel de administración
                </Typography>
                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 0.5, mb: 3, fontSize: 14 }}
                >
                    Ingresa con tu cuenta para continuar
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    autoComplete="username"
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Contraseña"
                    type={verClave ? "text" : "password"}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    autoComplete="current-password"
                    required
                    fullWidth
                    sx={{ mb: 3 }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setVerClave(!verClave)}
                                        edge="end"
                                        aria-label="Mostrar u ocultar contraseña"
                                    >
                                        {verClave ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={enviando}
                >
                    {enviando ? "Ingresando..." : "Ingresar"}
                </Button>
            </Card>
        </Box>
    );
}