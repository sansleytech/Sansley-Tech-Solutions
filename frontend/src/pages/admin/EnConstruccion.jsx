import { Box, Typography } from "@mui/material";

export default function EnConstruccion({ titulo }) {
    return (
        <Box>
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}
            >
                {titulo}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Este módulo lo construimos en uno de los siguientes pasos.
            </Typography>
        </Box>
    );
}
