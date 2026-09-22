import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import LockResetOutlined from "@mui/icons-material/LockResetOutlined";
import { peticionAdmin } from "../../admin/peticionAdmin.js";
import { obtenerSesion } from "../../admin/sesion.js";

const camposVacios = { actual: "", nueva: "", confirmar: "" };

export default function Cuenta() {
    const { usuario } = obtenerSesion();
    const [campos, setCampos] = useState(camposVacios);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setCampos({ ...campos, [campo]: valor });
        setError("");
        setExito("");
    }

    async function guardar(evento) {
        evento.preventDefault();
        setError("");
        setExito("");

        if (!campos.actual || !campos.nueva || !campos.confirmar) {
            return setError("Completa los tres campos");
        }
        if (campos.nueva.length < 8) {
            return setError(
                "La nueva contraseña debe tener al menos 8 caracteres",
            );
        }
        if (campos.nueva !== campos.confirmar) {
            return setError(
                "La confirmación no coincide con la nueva contraseña",
            );
        }
        if (campos.nueva === campos.actual) {
            return setError(
                "La nueva contraseña debe ser distinta a la actual",
            );
        }

        setGuardando(true);
        try {
            await peticionAdmin("/auth/contrasena", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    actual: campos.actual,
                    nueva: campos.nueva,
                }),
            });
            setExito("Tu contraseña se actualizó correctamente");
            setCampos(camposVacios);
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Box sx={{ maxWidth: 480 }}>
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
            >
                Mi cuenta
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                Sesión de {usuario.nombre} ({usuario.correo})
            </Typography>

            <Card variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", mb: 2.5 }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "action.hover",
                            color: "primary.main",
                        }}
                    >
                        <LockResetOutlined />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                        Cambiar contraseña
                    </Typography>
                </Stack>

                <Box component="form" onSubmit={guardar}>
                    <Stack spacing={2}>
                        {error && <Alert severity="error">{error}</Alert>}
                        {exito && <Alert severity="success">{exito}</Alert>}

                        <TextField
                            label="Contraseña actual"
                            type="password"
                            value={campos.actual}
                            onChange={(e) => cambiar("actual", e.target.value)}
                            autoComplete="current-password"
                            fullWidth
                        />
                        <TextField
                            label="Nueva contraseña"
                            type="password"
                            value={campos.nueva}
                            onChange={(e) => cambiar("nueva", e.target.value)}
                            autoComplete="new-password"
                            helperText="Mínimo 8 caracteres"
                            fullWidth
                        />
                        <TextField
                            label="Confirmar nueva contraseña"
                            type="password"
                            value={campos.confirmar}
                            onChange={(e) =>
                                cambiar("confirmar", e.target.value)
                            }
                            autoComplete="new-password"
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={guardando}
                            sx={{ alignSelf: "flex-start" }}
                        >
                            {guardando ? "Guardando..." : "Guardar contraseña"}
                        </Button>
                    </Stack>
                </Box>
            </Card>
        </Box>
    );
}
