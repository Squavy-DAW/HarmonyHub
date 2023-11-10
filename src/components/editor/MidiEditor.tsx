import "@styles/editor/MidiEditor.css"
import { createRef, useEffect, useRef, useState } from "react"

export default function MidiEditor() {

    const [zoom, setZoom] = useState(0);
    const _zoom = useRef(zoom);

    const [position, setPosition] = useState(0);
    const _position = useRef(position);

    const zoomBase = 100;

    const editorRef = createRef<HTMLDivElement>();

    function handleWheel(ev: WheelEvent) {
        if (ev.ctrlKey) {
            ev.preventDefault();

            let oldSize = zoomBase * Math.E ** _zoom.current;
            let value = _zoom.current - ev.deltaY / 300;
            _zoom.current = Math.max(Math.min(value, 2), -1);
            let newSize = zoomBase * Math.E ** _zoom.current;
            setZoom(_zoom.current);

            let counterWeight = ev.offsetX - ev.offsetX * newSize / oldSize;
            _position.current = Math.max(_position.current / oldSize * newSize - counterWeight, 0);
            setPosition(_position.current);
        }

        else if (ev.shiftKey) {
            let value = _position.current + ev.deltaY;
            _position.current = Math.max(value, 0);
            setPosition(_position.current);
        }

        else if (Math.abs(ev.deltaX) > 0) {
            let value = _position.current + ev.deltaX;
            _position.current = Math.max(value, 0);
            setPosition(_position.current);
        }
    }

    useEffect(() => {
        editorRef.current?.addEventListener('wheel', handleWheel);
        return () => {
            editorRef.current?.removeEventListener('wheel', handleWheel);
        }
    }, [])

    return (
        <section className="midi-editor" ref={editorRef} style={{ backgroundSize: `${zoomBase * Math.E ** zoom}px 72px`, backgroundPositionX: -position }}>
            {/* <p style={{ marginTop: '1200px' }}>
                Position: {position}
                <br />
                Scale: {zoom}
                <br />
                Size: {zoomBase * Math.E ** zoom}
                <br />
                <button onClick={() => { setZoom(0); _zoom.current = 0; setPosition(0); _position.current = 0; }}>Reset</button></p> */}
        </section>
    )
}