import "@src/styles/editor/SynthEditor.css"
import { createRef, useContext, useEffect, useRef, useState } from "react";
import AudioNodeProps, { defaultAudioEndNode, defaultOscillatorNode } from "@models/audionodeprops";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import SoundContext from "@src/context/soundcontext";
import LinePosition from "@models/linepositionprops";
import { Synth, createSynth } from "@synth/synth";

export default function SynthEditor(){
    const [nodes, setNodes] = useState<AudioNodeProps[]>([]);
    const { project } = useContext(ProjectContext);
    const [draggedNode, setDraggedNode] = useState<HTMLElement>();
    const [hoverOverLine, setHoverOverLine] = useState<HTMLElement>();
    const nodeOrigin = useRef({x: 0, y: 0});
    const nodesDragOverlay = createRef<HTMLUListElement>();
    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const [svgLines, setSvgLines] = useState<LinePosition[]>([]);
    const [svgDragLine, setSvgDragLine] = useState<LinePosition>();
    const _svgDragLine = useRef(svgDragLine);
    

    const { ctx, engine } = useContext(SoundContext);
    let synth:Synth|undefined = undefined;

    function handleNodeMouseDown(ev: React.MouseEvent){
        const target = ev.currentTarget as HTMLElement;
        nodeOrigin.current = {x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY};
        setDraggedNode(target);
        target.setAttribute("data-grab","grab");
    }

    function resetDataAllowed(){
        let connectionPoints = document.querySelectorAll(".audio-connection-node");
        connectionPoints.forEach(element => {
            let id = element.getAttribute("data-id");
            if(id == "out"){
                element.setAttribute("data-allowed","true");
            }
            else{
                element.setAttribute("data-allowed","false");
            }
        });
    }

    function handleConnectionMouseClick(ev: React.MouseEvent){
        ev.stopPropagation();
        const target = ev.currentTarget as HTMLElement;
        const {x,y} = target.getBoundingClientRect();
        let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
        let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;

        //startdrag
        let connectionPoints = document.querySelectorAll(".audio-connection-node");
        let targetAllowed = target.getAttribute("data-id");
        if((targetAllowed == "in" || targetAllowed == "mod") && !_svgDragLine.current){
            return;
        }
        else{   //out
            connectionPoints.forEach(element => {
                let id = element.getAttribute("data-id");
                if(id == "out"){
                    element.setAttribute("data-allowed","false");
                }
                else{
                    element.setAttribute("data-allowed","true");
                }
            });
        }

        if(_svgDragLine.current){
            if(target.getAttribute("data-id") == "out"){
                return;
            }

            if(!svgLines.find(e => (e.a == _svgDragLine.current?.a && e.b == target.getAttribute("data-key")!)
            || (e.a == target.getAttribute("data-key")! && e.b == _svgDragLine.current?.a)))
                setSvgLines([...svgLines, { 
                    x1: _svgDragLine.current.x1, 
                    y1: _svgDragLine.current.y1, 
                    x2: x - offsetX + target.clientWidth/2,
                    y2: y - offsetY + target.clientHeight/2,
                    a: _svgDragLine.current.a,
                    b: target.getAttribute("data-key")!
                }]);
            _svgDragLine.current = undefined;
            setSvgDragLine(undefined);
            resetDataAllowed();
            return;
        }

        _svgDragLine.current = { 
            x1: x - offsetX + target.clientWidth/2, 
            y1: y - offsetY + target.clientHeight/2, 
            x2: ev.clientX - offsetX, 
            y2: ev.clientY - offsetY,
            a: target.getAttribute("data-key")!,
            b: undefined
        };
        setSvgDragLine(_svgDragLine.current);
    }

    useEffect(() => {
        synth = createSynth(ctx);
        engine.synths.push(synth);
        return () => {
            engine.synths = engine.synths.filter(s => s != synth);
        }
    },[]);

    useEffect(() => {
        console.log(synth?.ctx + " -a- " + engine.synths.length);
        if (!mouseDown && draggedNode) {
            draggedNode.style.rotate = '0deg';
            draggedNode.setAttribute("data-grab","none");
            setDraggedNode(undefined);
            return;
        }
    }, [mouseDown])

    useEffect(() => {
        if(mouseDown && hoverOverLine){
            setSvgLines(svgLines.filter(x => x.a != hoverOverLine.getAttribute("data-a") || x.b != hoverOverLine.getAttribute("data-b")));
        }

        if (mouseDown && draggedNode) {
            let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
            let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;
            const left = mousePosition.x - offsetX - nodeOrigin.current.x
            const top = mousePosition.y - offsetY - nodeOrigin.current.y
            draggedNode.style.left = `${left}px`;
            draggedNode.style.top = `${top}px`;
            draggedNode.style.rotate = `${Math.min(Math.max(mouseDelta.x, -30), 30)}deg`;

            //update lines
            const connectors = Array.from(draggedNode.querySelectorAll(".audio-connection-node"));
            svgLines.forEach((l,idx) => {
                const connectorA = connectors.find(c => c.getAttribute('data-key') == l.a);
                const connectorB = connectors.find(c => c.getAttribute('data-key') == l.b);
                let newLines = [...svgLines];
                if (connectorA) {
                    const {x, y} = connectorA.getBoundingClientRect();
                    newLines[idx].x1 = x - offsetX + connectorA.clientWidth/2;
                    newLines[idx].y1 = y - offsetY + connectorA.clientHeight/2;
                }
                if (connectorB) {
                    const {x, y} = connectorB?.getBoundingClientRect();
                    newLines[idx].x2 = x - offsetX + connectorB.clientWidth/2;
                    newLines[idx].y2 = y - offsetY + connectorB.clientHeight/2;
                }
                setSvgLines(newLines);
            });
        }
    }, [mousePosition, mouseDelta])

    useEffect(() => {
        if(!_svgDragLine.current)return;
        let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
        let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;
        setSvgDragLine({
            x1: _svgDragLine.current.x1, 
            y1: _svgDragLine.current.y1, 
            x2: mousePosition.x - offsetX, 
            y2: mousePosition.y - offsetY,
            a: _svgDragLine.current.a,
            b: _svgDragLine.current.b
        });
    }, [mousePosition])

    return (<section className="synth-editor" onClick={
        ()=>{
            _svgDragLine.current = undefined;
            setSvgDragLine(undefined);
            resetDataAllowed();
        }
    }>
        <ul ref={nodesDragOverlay}>
                {nodes?.map((node, i) =>
                    {
                        return <li key={`node[${i}]`} className='audionode'
                        onMouseDown={handleNodeMouseDown} 
                        style={{width:node.data.width+"px", height:node.data.height+"px"}}
                        data-id={node.id}
                        data-drag="none">
                            {node.name}
                            {
                                node.data.connectionpoints.map((connector,j) => 
                                    <div className="audio-connection-node" key={`node-connector[${i}${j}]`} data-key={`node-connector[${i}${j}]`}
                                    onMouseDown={handleConnectionMouseClick}
                                    onMouseUp={handleConnectionMouseClick}
                                    data-id={connector.id}
                                    data-allowed={connector.id=="out"?true:false}
                                    style={{top: connector.top+"px", left: connector.left+"px", bottom: connector.bottom+"px", right: connector.right+"px"}}></div>
                                )
                            }
                        </li>
                    }
                )}
        </ul>
        <div className="controls">
            <ul>
                <li>
                <button onClick={() => {
                    setNodes([...nodes, defaultAudioEndNode]);
                    }}>
                    Add AudioEndNode
                </button>
                </li>
                <li>
                <button onClick={() => {
                    setNodes([...nodes, defaultOscillatorNode]);
                    }}>
                    Add Oscillator
                </button>
                </li>
            </ul>
        </div>
        <svg className="connection-lines" width="100%" height="100%">
            {svgDragLine && <line className="dragged-connection-line" x1={svgDragLine.x1} y1={svgDragLine.y1} x2={svgDragLine.x2} y2={svgDragLine.y2} stroke="black" strokeWidth="5"/>}
            {svgLines.map((l,i) => (
                <line key={`connection-line[${i}]`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="black" strokeWidth="5" data-a={l.a} data-b={l.b}
                className="placed-line"
                onMouseEnter={(e)=>{
                    setHoverOverLine(e.target as HTMLElement);
                }}
                onMouseLeave={(e)=>{
                    setHoverOverLine(undefined);
                }}/>
            ))}
        </svg>
        
    </section>)
}