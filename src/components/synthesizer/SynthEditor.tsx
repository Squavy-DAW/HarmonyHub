import "@src/styles/editor/SynthEditor.css"
import { createRef, useContext, useEffect, useRef, useState } from "react";
import AudioNodeProps from "@models/audionodeprops";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import SoundContext from "@src/context/soundcontext";
import LinePosition from "@models/linepositionprops";

export default function SynthEditor(){
    const [nodes, setNodes] = useState<AudioNodeProps[]>([]);
    const { project } = useContext(ProjectContext);
    const [draggedNode, setDraggedNode] = useState<HTMLElement>();
    const nodeOrigin = useRef({x: 0, y: 0});
    const nodesDragOverlay = createRef<HTMLUListElement>();
    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const [svgLines, setSvgLines] = useState<LinePosition[]>([]);
    const [svgDragLine, setSvgDragLine] = useState<LinePosition>();
    const _svgDragLine = useRef(svgDragLine);


    const { ctx } = useContext(SoundContext);

    function handleNodeMouseDown(ev: React.MouseEvent){
        const target = ev.currentTarget as HTMLElement;
        nodeOrigin.current = {x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY};
        setDraggedNode(target);
    }

    function handleConnectionMouseDown(ev: React.MouseEvent){
        const target = ev.currentTarget as HTMLElement;
        const {x,y} = target.getBoundingClientRect();
        ev.stopPropagation();
        let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
        let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;
        setSvgDragLine({ 
            x1: x - offsetX + target.clientWidth/2, 
            y1: y - offsetY + target.clientHeight/2, 
            x2: ev.clientX - offsetX, 
            y2: ev.clientY - offsetY 
        });
        _svgDragLine.current = { x1: x + target.clientWidth/2, y1:y + target.clientWidth/2, x2: ev.clientX, y2: ev.clientY };
    }

    useEffect(() => {
        if (!mouseDown && draggedNode) {
            draggedNode.style.rotate = '0deg';

            setDraggedNode(undefined);
            return;
        }
    }, [mouseDown])

    useEffect(() => {
        if (mouseDown && draggedNode) {
            const left = mousePosition.x - nodesDragOverlay.current!.getBoundingClientRect().x - nodeOrigin.current.x
            const top = mousePosition.y - nodesDragOverlay.current!.getBoundingClientRect().y - nodeOrigin.current.y
            draggedNode.style.left = `${left}px`;
            draggedNode.style.top = `${top}px`;
            draggedNode.style.rotate = `${Math.min(Math.max(mouseDelta.x, -30), 30)}deg`;
        }
    }, [mousePosition, mouseDelta])

    useEffect(() => {
        if(!_svgDragLine.current)return;
        let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
        let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;
        setSvgDragLine({
            x1: _svgDragLine.current.x1 - offsetX, 
            y1: _svgDragLine.current.y1 - offsetY, 
            x2: mousePosition.x - offsetX, 
            y2: mousePosition.y - offsetY 
        });
    }, [mousePosition])



    return (<section className="synth-editor">
        <ul ref={nodesDragOverlay}>
                {nodes?.map((node, i) =>
                    <li key={`node[${i}]`} className='audionode'
                        onMouseDown={handleNodeMouseDown}>
                        {node.name}
                        <div className="audio-connection-node"
                        onMouseDown={handleConnectionMouseDown}></div>
                    </li>
                )}
        </ul>
        <div className="controls">
            <button onClick={() => {
                setNodes([...nodes ?? [], {
                    name: 'New AudioNode',
                    hue: 90,
                    data: {
                        x: 0,
                        y: 0,
                        height: 100,
                        width: 100
                    }
                }]);
            }}>
                Add AudioNode
            </button>
        </div>
        <svg className="connection-lines" width="100%" height="100%">
            {svgDragLine && <line className="dragged-connection-line" x1={svgDragLine.x1} y1={svgDragLine.y1} x2={svgDragLine.x2} y2={svgDragLine.y2} stroke="black" strokeWidth="5"/>}
            {svgLines.map((l,i) => (
                <line key={`connection-line[${i}]`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="black" strokeWidth="5"/>
            ))}
        </svg>
        
    </section>)
}