import { useContext, useRef, useState } from "react";
import "@styles/editor/Selection.css";
import PositionContext from "@src/context/positioncontext";
import ZoomContext from "@src/context/zoomcontext";

export interface ISelectable {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function Selection({
    selection,
    onSelectionChange,
    onSelectionStart,
    onSelectionEnd,
    ...rest
}: {
    selection: ISelectable[];
    onSelectionChange: (selection: string[]) => void;
    onSelectionStart?: () => void;
    onSelectionEnd?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
    const { position } = useContext(PositionContext);
    const { factor } = useContext(ZoomContext);

    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const _selectionOrigin = useRef<{ x: number, y: number }>();
    const _selectedNotes = useRef(new Set<string>());

    const selectionRef = useRef<HTMLDivElement>(null);

    function handleSelectionStart(ev: React.MouseEvent) {
        if (ev.buttons == 1 && ev.shiftKey) {
            ev.stopPropagation();

            let rect = selectionRef.current!.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;

            _selectionOrigin.current = { x: x, y: y };
            setSelectionStart({ x: x, y: y });
            setSelectionEnd({ x: x, y: y });
            onSelectionStart?.();
        }

        if (ev.nativeEvent.which == 3) {
            ev.stopPropagation();
            onSelectionChange([]);
        };
    }

    function handleSelectionStop(ev: React.MouseEvent) {
        _selectionOrigin.current = undefined;
        setSelectionStart({ x: 0, y: 0 });
        setSelectionEnd({ x: 0, y: 0 });
        onSelectionEnd?.();
    }

    function handleSelectionSize(ev: React.MouseEvent) {
        if (_selectionOrigin.current && ev.buttons == 1 && ev.shiftKey) {
            ev.stopPropagation();

            let rect = selectionRef.current!.getBoundingClientRect();
            let x = ev.clientX - rect.left;
            let y = ev.clientY - rect.top;
            setSelectionStart({
                x: Math.min(x, _selectionOrigin.current.x),
                y: Math.min(y, _selectionOrigin.current.y)
            });
            setSelectionEnd({
                x: Math.max(x, _selectionOrigin.current.x),
                y: Math.max(y, _selectionOrigin.current.y)
            });

            let startX = (selectionStart.x + position) / factor;
            let endX = (selectionEnd.x + position) / factor;
            
            selection.forEach(selectable => {
                let startY = selectionStart.y / selectable.height;
                let endY = selectionEnd.y / selectable.height;
                if ((
                    selectable.x + selectable.width > startX && selectable.x <= endX ||
                    selectable.x >= endX && selectable.x <= startX) && (
                        selectable.y + 1 >= startY && selectable.y <= endY ||
                        selectable.y <= startY && selectable.y >= endY)
                ) {
                    _selectedNotes.current.add(selectable.id);
                } else {
                    _selectedNotes.current.delete(selectable.id);
                }
            });

            onSelectionChange(Array.from(_selectedNotes.current));
        }
    }

    return (
        <div className="selection-container" ref={selectionRef}
            {...rest}
            onMouseDown={handleSelectionStart}
            onMouseUp={handleSelectionStop}
            onMouseMove={handleSelectionSize}
            onContextMenu={ev => ev.preventDefault()}>
            <div className="selection" hidden={
                selectionStart.x == selectionEnd.x &&
                selectionStart.y == selectionEnd.y
            } style={{
                width: `${Math.abs(selectionStart.x - selectionEnd.x)}px`,
                height: `${Math.abs(selectionStart.y - selectionEnd.y)}px`,
                left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
            }} />
            {rest.children}
        </div>
    )
}