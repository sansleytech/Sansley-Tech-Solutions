import { useState } from "react";
import { Box, Typography } from "@mui/material";
import Aparecer from "./Aparecer.jsx";

const fuenteTitulos = '"Poppins", "Helvetica", "Arial", sans-serif';

// Saca las iniciales del nombre para cuando la persona no tiene foto
function iniciales(nombre = "") {
    return nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra[0].toUpperCase())
        .join("");
}

// Espacio que se muestra cuando no hay foto (o si la foto falla al cargar)
function SinFoto({ nombre }) {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
            }}
        >
            <Box
                sx={{
                    width: { xs: 120, md: 148 },
                    height: { xs: 120, md: 148 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#fff",
                    color: "primary.main",
                    fontFamily: fuenteTitulos,
                    fontWeight: 700,
                    fontSize: { xs: 40, md: 50 },
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 0 0 14px rgba(1,89,177,.05), 0 12px 30px rgba(10,37,64,.10)",
                }}
            >
                {iniciales(nombre)}
            </Box>
        </Box>
    );
}

// Tarjeta grande de una persona del equipo: foto arriba y datos en una franja azul marino.
export default function TarjetaMiembro({ miembro, indice = 0 }) {
    const [falloFoto, setFalloFoto] = useState(false);
    const hayFoto = Boolean(miembro.foto) && !falloFoto;

    return (
        <Aparecer retraso={indice * 0.1} sx={{ height: "100%" }}>
            <Box
                component="article"
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderRadius: "16px",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 10px 30px rgba(10,37,64,.08)",
                    transition: "transform .3s ease, box-shadow .3s ease",
                    "@media (hover: hover)": {
                        "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 22px 48px rgba(10,37,64,.16)",
                        },
                        "&:hover .foto": { transform: "scale(1.04)" },
                        "&:hover .acento": { width: 64 },
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                        "&:hover": { transform: "none" },
                        "&:hover .foto": { transform: "none" },
                    },
                }}
            >
                {/* Foto */}
                <Box
                    sx={{
                        position: "relative",
                        height: { xs: 400, md: 460 },
                        overflow: "hidden",
                        background:
                            "radial-gradient(70% 55% at 50% 30%, #FFFFFF 0%, rgba(255,255,255,0) 100%), linear-gradient(180deg, #EAF1FB 0%, #D5E3F5 100%)",
                    }}
                >
                    {hayFoto ? (
                        <Box
                            component="img"
                            className="foto"
                            src={miembro.foto}
                            alt={`${miembro.nombre}, ${miembro.cargo}`}
                            loading="lazy"
                            onError={() => setFalloFoto(true)}
                            sx={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center top",
                                transition: "transform .6s cubic-bezier(.22,1,.36,1)",
                            }}
                        />
                    ) : (
                        <SinFoto nombre={miembro.nombre} />
                    )}
                </Box>

                {/* Datos */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: "marino.main",
                        color: "#fff",
                        px: { xs: 3, md: 3.5 },
                        pt: 3,
                        pb: { xs: 3.5, md: 4 },
                        borderTop: "3px solid",
                        borderColor: "secondary.main",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "secondary.light",
                        }}
                    >
                        {miembro.cargo}
                    </Typography>

                    <Typography
                        component="h3"
                        sx={{
                            mt: 0.75,
                            fontFamily: fuenteTitulos,
                            fontWeight: 700,
                            fontSize: { xs: 23, md: 26 },
                            lineHeight: 1.2,
                        }}
                    >
                        {miembro.nombre}
                    </Typography>

                    <Box
                        className="acento"
                        aria-hidden="true"
                        sx={{
                            mt: 1.75,
                            width: 36,
                            height: 2,
                            borderRadius: 1,
                            background: "linear-gradient(90deg, #3B9BFF, #8EE04A)",
                            transition: "width .35s ease",
                        }}
                    />

                    {miembro.descripcion && (
                        <Typography
                            sx={{
                                mt: 1.75,
                                fontSize: 14.5,
                                lineHeight: 1.65,
                                color: "rgba(255,255,255,.78)",
                            }}
                        >
                            {miembro.descripcion}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Aparecer>
    );
}
