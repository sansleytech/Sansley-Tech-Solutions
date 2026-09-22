import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

// Número que cuenta desde 0 hasta su valor cuando aparece en pantalla
export default function Contador({ valor, duracion = 1.6 }) {
    const ref = useRef(null);
    const visible = useInView(ref, { once: true });
    const sinMovimiento = useReducedMotion();
    const [numero, setNumero] = useState(0);

    useEffect(() => {
        if (!visible || sinMovimiento) return;

        const control = animate(0, valor, {
            duration: duracion,
            ease: "easeOut",
            onUpdate: (v) => setNumero(Math.round(v)),
        });
        return () => control.stop();
    }, [visible, valor, duracion, sinMovimiento]);

    return <span ref={ref}>{sinMovimiento ? valor : numero}</span>;
}
