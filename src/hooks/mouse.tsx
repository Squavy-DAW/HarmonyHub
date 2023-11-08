import { useEffect, useState } from "react";

export default function useMouse() {
    const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [mouseDelta, setMouseDelta] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [mouseDown, setMouseDown] = useState<boolean>(false);

    function handleMouseMove(ev: MouseEvent) {
        setMouseDelta({
            x: ev.movementX,
            y: ev.movementY
        });
        setMousePosition({
            x: ev.clientX,
            y: ev.clientY
        });
    }

    function handleMouseDown(_ev: MouseEvent) {
        setMouseDown(true);
    }

    function handleMouseUp(_ev: MouseEvent) {
        setMouseDown(false);
    }

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, [])

    return { mousePosition, mouseDelta, mouseDown };
}