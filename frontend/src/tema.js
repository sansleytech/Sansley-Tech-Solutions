import { createTheme } from "@mui/material/styles";

const fuenteTitulos = '"Poppins", "Helvetica", "Arial", sans-serif';

// Colores y efectos de la marca que se reutilizan en varias partes del sitio
export const degradadoMarca = "linear-gradient(135deg, #0159B1 0%, #2E8BFF 50%, #5B921F 100%)";
export const brilloAzul = "0 0 28px rgba(59,155,255,.45)";

const tema = createTheme({
    palette: {
        primary: {
            main: "#0159B1",
            light: "#4C8FDB",
            dark: "#053B8B",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#5B921F",
            light: "#9CCB5C",
            dark: "#3F6E14",
            contrastText: "#FFFFFF",
        },
        marino: { main: "#0A2540", light: "#0F3559", dark: "#061A2E" },
        // Colores del portal futurista: fondo de noche y neones azul y verde
        noche: { main: "#050B1A", light: "#0B1730", dark: "#030712" },
        cielo: { main: "#3B9BFF", light: "#8CC4FF" },
        lima: { main: "#8EE04A", light: "#B9F27F" },
        background: { default: "#F7F9FC", paper: "#FFFFFF" },
        text: { primary: "#0A2540", secondary: "#5B6B82" },
        divider: "#E3E9F2",
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: fuenteTitulos, fontWeight: 800 },
        h2: { fontFamily: fuenteTitulos, fontWeight: 700 },
        h3: { fontFamily: fuenteTitulos, fontWeight: 700 },
        h4: { fontFamily: fuenteTitulos, fontWeight: 700 },
        h5: { fontFamily: fuenteTitulos, fontWeight: 600 },
        h6: { fontFamily: fuenteTitulos, fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: { scrollBehavior: "smooth" },
                body: { overflowX: "hidden" },
                "::selection": { background: "#3B9BFF", color: "#fff" },
                "@media (prefers-reduced-motion: reduce)": {
                    html: { scrollBehavior: "auto" },
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 999, padding: "10px 24px" },
            },
        },
    },
});

export default tema;