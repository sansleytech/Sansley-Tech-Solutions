import { Box, IconButton, Tooltip } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

// MUI no trae el ícono de TikTok, así que lo dibujamos nosotros
function TikTokIcon(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            {...props}
        >
            <path d="M16.6 5.82c-.9-.8-1.47-1.94-1.6-3.22h-3.1v13.44c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-2.72-2.72 2.72 2.72 0 0 1 2.72-2.72c.28 0 .55.04.8.12v-3.17a5.9 5.9 0 0 0-.8-.05A5.87 5.87 0 0 0 3.32 16 5.87 5.87 0 0 0 9.18 21.85 5.87 5.87 0 0 0 15.05 16V9.01a8.35 8.35 0 0 0 4.87 1.56V7.47a5.14 5.14 0 0 1-3.32-1.65Z" />
        </svg>
    );
}

// Ícono según la clave que usa la base de datos
const ICONOS = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    linkedin: LinkedInIcon,
    tiktok: TikTokIcon,
};

const NOMBRES = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
};

// Asegura que el enlace tenga protocolo, para que no intente abrir una ruta relativa del sitio
function conProtocolo(url) {
    if (!url) return null;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}


export default function RedesSociales({
    redes,
    tamano = 18,
    espaciado = 1,
    color,
    colorHover,
}) {
    const activas = Object.keys(ICONOS).filter((clave) => redes?.[clave]);
    if (activas.length === 0) return null;

    return (
        <Box sx={{ display: "flex", gap: espaciado, flexWrap: "wrap" }}>
            {activas.map((clave) => {
                const Icono = ICONOS[clave];
                return (
                    <Tooltip key={clave} title={NOMBRES[clave]}>
                        <IconButton
                            component="a"
                            href={conProtocolo(redes[clave])}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={NOMBRES[clave]}
                            size="small"
                            sx={{
                                width: tamano + 16,
                                height: tamano + 16,
                                color: color ?? "rgba(255,255,255,.68)",
                                border: "1px solid rgba(255,255,255,.16)",
                                transition:
                                    "color .2s, border-color .2s, transform .2s",
                                "&:hover": {
                                    color: colorHover ?? "lima.light",
                                    borderColor: "rgba(255,255,255,.32)",
                                    transform: "translateY(-2px)",
                                },
                                "@media (prefers-reduced-motion: reduce)": {
                                    "&:hover": { transform: "none" },
                                },
                            }}
                        >
                            <Icono sx={{ fontSize: tamano }} />
                        </IconButton>
                    </Tooltip>
                );
            })}
        </Box>
    );
}
