import ContextContext from "@src/context/contextcontext";
import NetworkContext from "@src/context/networkcontext";
import PositionContext from "@src/context/positioncontext";
import ZoomContext from "@src/context/zoomcontext";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { produce } from "immer";
import { throttle } from "throttle-debounce";
import "@styles/editor/MouseCursors.css";
import UserContext from "@src/context/usercontext";

type MousePosition = {
    [userId: string]: {
        x: number,
        y: number
    }
}

export default function ({ ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    const { position } = useContext(PositionContext);
    const { zoom, factor } = useContext(ZoomContext);
    const { socket } = useContext(NetworkContext);
    const { context } = useContext(ContextContext);
    const { usernames } = useContext(UserContext);

    const [mousePositions, setMousePositions] = useState<MousePosition>({});
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    function handleMouseMove(ev: React.MouseEvent) {
        const { x: offsetX, y: offsetY } = ev.currentTarget.getBoundingClientRect();
        let x = ev.clientX - offsetX;
        let y = ev.clientY - offsetY;
        setMousePosition({ x, y });
    }

    const throttledSendMousePosition = useCallback(throttle(100, 
        function (mousePosition: { x: number, y: number }, position: number, factor: number) {
            socket?.broadcast('hh:mouse-position', {
                context: context,
                x: (mousePosition.x + position) / factor,
                y: mousePosition.y,
            });
        }
    ), [socket, context]);

    useEffect(() => {
        throttledSendMousePosition(mousePosition, position, factor);
    }, [zoom, position, mousePosition, socket]);

    // const handleReceiveMousePosition = 

    useEffect(() => {
        if (socket) {
            socket.addEventListener('hh:mouse-position', (id, { context: c, x, y }) => {
                console.log(`received ${x}, ${y}`);
                
                if (c != context) return;
                setMousePositions(produce(draft => {
                    draft[id] = { x, y };
                }));
            })

            // todo cleanup function
        }
    }, [socket]);

    // todo on component unmount send remove cursor message

    return (
        <section className="mouse-cursors-container" onMouseMove={handleMouseMove} {...rest}>
            {rest.children}
            <div className="mouse-cursors" style={{ left: -position }}>
                {Object.keys(mousePositions).map(id => {
                    const pos = mousePositions[id];
                    return <div key={id} className="cursor" style={{ left: pos.x * factor, top: pos.y }}>
                        <span className="cursor-name">{usernames[id]}</span>
                    </div>
                })}
            </div>
        </section>
    )
}