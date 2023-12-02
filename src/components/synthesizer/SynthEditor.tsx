//TODO: Multiple lines can be routed into a single mod. This should not be possible exclusevly on mod-connectors!

import "@src/styles/editor/SynthEditor.css"
import { createRef, useContext, useEffect, useRef, useState } from "react";
import RoutableAudioNode, { defaultAudioEndNode, defaultOscillatorNode } from "@models/audionode";
import useMouse from "@src/hooks/mouse";
import LinePosition from "@models/lineposition";
import { Synth } from "@synth/synth";
import { generateId } from "@network/crypto";
import ProjectContext from "@src/context/projectcontext";
import { produce } from "immer"

export default function SynthEditor(props:{trackId: string}){
    const { project, setProject } = useContext(ProjectContext);
    const [draggedNode, setDraggedNode] = useState<HTMLElement>();
    const [hoverOverLine, setHoverOverLine] = useState<HTMLElement>();
    const nodeOrigin = useRef({x: 0, y: 0});
    const nodesDragOverlay = createRef<HTMLUListElement>();
    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const [svgLines, setSvgLines] = useState<LinePosition[]>([]);
    const [svgDragLine, setSvgDragLine] = useState<LinePosition>();
    const _svgDragLine = useRef(svgDragLine);
    
    const [synth] = useState<Synth>(project.data.tracks[props.trackId].instrument);
    
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
            || (e.a == target.getAttribute("data-synth-id")! && e.b == _svgDragLine.current?.a))){
                //add synth-route
                let node2 = synth.audioNodes[target.getAttribute("data-synth-id")!].id;
                let node1 = synth.audioNodes[_svgDragLine.current.synth!].id;
                let type = ""+target.getAttribute("data-type");    //TODO: z.B. mod-pan or in-in
                if(node1 === undefined || node2 === undefined){
                    console.error(`no nodes where found for: ${target.getAttribute("data-synth-id")}`);
                }else{
                    addRouteToSynth(node1, node2, type);
                }

                //add svg-line
                setSvgLines([...svgLines, { 
                    x1: _svgDragLine.current.x1, 
                    y1: _svgDragLine.current.y1, 
                    x2: x - offsetX + target.clientWidth/2,
                    y2: y - offsetY + target.clientHeight/2,
                    a: _svgDragLine.current.a,
                    b: target.getAttribute("data-key")!,
                    synth: target.getAttribute("data-synth-id")!
                }]);
            }
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
            b: undefined,
            synth: target.getAttribute("data-synth-id")!
        };
        setSvgDragLine(_svgDragLine.current);
    }

    function addElementToSynth(props: RoutableAudioNode){
        if(synth.audioNodes[props.id!]){
            console.error("param id already exists!"+props.id);
            return;
        }
        synth.audioNodes[props.id!] = props;
    }

    function addRouteToSynth(id1: string, id2: string, type:string){
        synth.routes.insert(id1, id2, type);
    }

    useEffect(() => {
        //Do stuff on first load
    }, []);

    useEffect(() => {
        setProject(produce(draft => {
            draft.data.tracks[props.trackId].instrument = synth;
        }))
    }, [synth])

    useEffect(() => {
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
            b: _svgDragLine.current.b,
            synth: _svgDragLine.current.synth
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
                {Object.keys(synth.audioNodes).map(id => {
                    const audioNode = synth.audioNodes[id];
                        return <li key={`node[${id}]`} className='audionode'
                        onMouseDown={handleNodeMouseDown} 
                        style={{width:audioNode.width+"px", height:audioNode.height+"px"}}
                        data-type={audioNode.type}
                        data-drag="none">
                            {audioNode.name}
                            {
                                audioNode.connectionpoints.map((connector,j) => 
                                    <div className="audio-connection-node" key={`node-connector[${id}${j}]`}
                                    onMouseDown={handleConnectionMouseClick}
                                    onMouseUp={handleConnectionMouseClick}
                                    data-id={connector.id}
                                    data-allowed={connector.id=="out"?true:false}
                                    data-synth-id={audioNode.id}
                                    data-type={connector.type}
                                    data-key={`node-connector[${id}${j}]`}    //TODO: Use this to fix a serious bug
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
                    let node = defaultAudioEndNode();
                    const id = generateId(new Set(Object.keys(synth.audioNodes)));
                    node.id = id;
                    node.name = node.id;    //temp
                    
                    addElementToSynth(node);
                }}>
                    Add AudioEndNode
                </button>
                </li>
                <li>
                <button onClick={() => {
                    let node = defaultOscillatorNode();
                    const id = generateId(new Set(Object.keys(synth.audioNodes)));
                    node.id = id;
                    node.name = id; //temp

                    addElementToSynth(node);
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
                onMouseLeave={()=>{
                    setHoverOverLine(undefined);
                }}/>
            ))}
        </svg>
        
    </section>)
}