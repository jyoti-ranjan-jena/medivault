import { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export default function Magnet({ children, padding = 100, disabled = false, magnetStrength = 2 }) {
    const [isActive, setIsActive] = useState(false);
    const ref = useRef(null);

    const x = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 });
    const y = useSpring(0, { stiffness: 300, damping: 20, mass: 0.5 });

    useEffect(() => {
        if (disabled) return;

        const handleMouseMove = (e) => {
            if (!ref.current) return;
            const { left, top, width, height } = ref.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const distX = Math.abs(centerX - e.clientX);
            const distY = Math.abs(centerY - e.clientY);

            // If mouse is within the padding area, activate magnet
            if (distX < width / 2 + padding && distY < height / 2 + padding) {
                setIsActive(true);
                const offsetX = (e.clientX - centerX) / magnetStrength;
                const offsetY = (e.clientY - centerY) / magnetStrength;
                x.set(offsetX);
                y.set(offsetY);
            } else {
                setIsActive(false);
                x.set(0);
                y.set(0);
            }
        };

        const handleMouseLeave = () => {
            setIsActive(false);
            x.set(0);
            y.set(0);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [padding, disabled, magnetStrength, x, y]);

    return (
        <motion.div
            ref={ref}
            style={{ x, y, position: "relative", display: "inline-block" }}
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
}