import { Link as RouterLink, useOutletContext } from "react-router-dom";
import {
    Box,
    Card,
    CardActionArea,
    Chip,
    Skeleton,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { obtenerSesion } from "../../admin/sesion.js";
import { menu } from "../../admin/menu.jsx";

// Fecha corta en español de Colombia, por ejemplo "21 sept 2026, 3:55 p. m."
const formatoFecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
});

// Busca el ícono del menú para reutilizarlo en las tarjetas
const iconoDe = (ruta) => menu.find((item) => item.ruta === ruta)?.icono;

/* ---------- Tarjeta con un número ---------- */
function Indicador({ titulo, valor, detalle, ruta, resaltado }) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderColor: resaltado ? "secondary.main" : "divider",
                bgcolor: resaltado
                    ? (t) => alpha(t.palette.secondary.main, 0.06)
                    : "background.paper",
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={ruta}
                sx={{ p: { xs: 1.75, md: 2.5 }, height: "100%" }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "primary.main",
                        "& svg": { fontSize: 22 },
                    }}
                >
                    {iconoDe(ruta)}
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: 13, fontWeight: 600 }}
                    >
                        {titulo}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        mt: 1,
                        fontSize: { xs: 30, md: 36 },
                        fontWeight: 800,
                        lineHeight: 1,
                    }}
                >
                    {valor}
                </Typography>
                <Typography
                    color="text.secondary"
                    sx={{ fontSize: 12.5, mt: 0.75 }}
                >
                    {detalle}
                </Typography>
            </CardActionArea>
        </Card>
    );
}

/* ---------- Fila de un mensaje reciente ---------- */
function FilaMensaje({ mensaje, separador }) {
    return (
        <CardActionArea
            component={RouterLink}
            to="/admin/mensajes"
            sx={{
                p: 2,
                display: "block",
                borderTop: separador ? "1px solid" : "none",
                borderColor: "divider",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                }}
            >
                <Typography sx={{ fontWeight: mensaje.leido ? 600 : 800 }}>
                    {mensaje.nombre}
                </Typography>
                {!mensaje.leido && (
                    <Chip size="small" color="secondary" label="Nuevo" />
                )}
                {mensaje.servicio && (
                    <Chip size="small" variant="outlined" label={mensaje.servicio} />
                )}
            </Box>
            <Typography
                color="text.secondary"
                sx={{
                    fontSize: 14,
                    mt: 0.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
            >
                {mensaje.mensaje}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
                {formatoFecha.format(new Date(mensaje.fecha_creacion))}
            </Typography>
        </CardActionArea>
    );
}

/* ---------- Página ---------- */
export default function Resumen() {
    const { usuario } = obtenerSesion();
    // Los números los trae el menú lateral (LayoutAdmin) y los comparte con esta pantalla
    const { resumen } = useOutletContext();

    return (
        <Box>
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
            >
                Hola, {usuario.nombre}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                Así va todo en Sansley.
            </Typography>

            {/* Los cuatro números */}
            <Box
                sx={{
                    display: "grid",
                    gap: { xs: 1.5, md: 2 },
                    gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "repeat(4, 1fr)",
                    },
                }}
            >
                {!resumen &&
                    [0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rounded" height={130} />
                    ))}

                {resumen && (
                    <>
                        <Indicador
                            titulo="Proyectos"
                            valor={resumen.proyectos.publicados}
                            detalle={`publicados de ${resumen.proyectos.total}`}
                            ruta="/admin/proyectos"
                        />
                        <Indicador
                            titulo="Servicios"
                            valor={resumen.servicios.activos}
                            detalle={`visibles de ${resumen.servicios.total}`}
                            ruta="/admin/servicios"
                        />
                        <Indicador
                            titulo="Equipo"
                            valor={resumen.equipo.activos}
                            detalle={`visibles de ${resumen.equipo.total}`}
                            ruta="/admin/equipo"
                        />
                        <Indicador
                            titulo="Mensajes"
                            valor={resumen.mensajes.sinLeer}
                            detalle={`sin leer de ${resumen.mensajes.total}`}
                            ruta="/admin/mensajes"
                            resaltado={resumen.mensajes.sinLeer > 0}
                        />
                    </>
                )}
            </Box>

            {/* Últimos mensajes */}
            <Box
                sx={{
                    mt: { xs: 3, md: 4 },
                    mb: 1.5,
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, fontSize: { xs: 20, md: 22 } }}
                >
                    Últimos mensajes
                </Typography>
                <Typography
                    component={RouterLink}
                    to="/admin/mensajes"
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "primary.main",
                        textDecoration: "none",
                    }}
                >
                    Ver todos
                </Typography>
            </Box>

            <Card variant="outlined">
                {!resumen && <Skeleton variant="rounded" height={120} />}

                {resumen && resumen.ultimosMensajes.length === 0 && (
                    <Typography
                        color="text.secondary"
                        align="center"
                        sx={{ p: 4 }}
                    >
                        Todavía no ha llegado ningún mensaje desde el
                        formulario de contacto.
                    </Typography>
                )}

                {resumen &&
                    resumen.ultimosMensajes.map((mensaje, indice) => (
                        <FilaMensaje
                            key={mensaje.id}
                            mensaje={mensaje}
                            separador={indice > 0}
                        />
                    ))}
            </Card>
        </Box>
    );
}