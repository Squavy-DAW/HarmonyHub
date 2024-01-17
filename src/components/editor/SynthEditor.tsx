//TODO: Multiple lines can be routed into a single mod. This should not be possible exclusevly on mod-connectors!

import "@src/styles/editor/SynthEditor.css"
import { createRef, useContext, useEffect, useRef, useState } from "react";
import RoutableAudioNode, { defaultAudioEndNode, defaultCompressorNode, defaultOscillatorNode } from "@models/synth/audionode";
import useMouse from "@src/hooks/mouse";
import LinePosition from "@models/synth/lineposition";
import { generateId } from "@network/crypto";
import { ModRoM, ModType, RouteModElement, RouteNodeElement } from "@models/synth/modRoM";
import SoundContext from "@src/context/soundcontext";
import { produce } from "immer";
import { AudioEngine } from "@synth/audioengine";
import ProjectContext from "@src/context/projectcontext";
import Knob from "@src/components/editor/synthesizer/Knob";
import Piano from "./midi/Piano";
import { Allotment, LayoutPriority } from "allotment";

export default function SynthEditor(props: { trackId: string }) {
    const { ctx } = useContext(SoundContext);
    const { project, setProject } = useContext(ProjectContext);
    const synth = project.data.tracks[props.trackId].instrument;

    const [draggedNode, setDraggedNode] = useState<HTMLElement>();
    const [hoverOverLine, setHoverOverLine] = useState<HTMLElement>();
    const nodeOrigin = useRef({ x: 0, y: 0 });
    const nodesDragOverlay = createRef<HTMLUListElement>();
    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const [svgLines, setSvgLines] = useState<LinePosition[]>([]);
    const [svgDragLine, setSvgDragLine] = useState<LinePosition>();
    const _svgDragLine = useRef(svgDragLine);

    function handleNodeMouseDown(ev: React.MouseEvent) {
        const target = ev.currentTarget as HTMLElement;
        nodeOrigin.current = { x: ev.nativeEvent.offsetX, y: ev.nativeEvent.offsetY };
        setDraggedNode(target);
        target.setAttribute("data-grab", "grab");
    }

    function resetDataAllowed() {
        let connectionPoints = document.querySelectorAll(".audio-connection-node");
        connectionPoints.forEach(element => {
            let id = element.getAttribute("data-id");
            if (id == "out") {
                element.setAttribute("data-allowed", "true");
            }
            else {
                element.setAttribute("data-allowed", "false");
            }
        });
    }

    function handleConnectionMouseClick(ev: React.MouseEvent) {
        ev.stopPropagation();
        const target = ev.currentTarget as HTMLElement;
        const { x, y } = target.getBoundingClientRect();
        let offsetX = nodesDragOverlay.current!.getBoundingClientRect().x;
        let offsetY = nodesDragOverlay.current!.getBoundingClientRect().y;

        //startdrag
        let connectionPoints = document.querySelectorAll(".audio-connection-node");
        let targetAllowed = target.getAttribute("data-id");
        if ((targetAllowed == "in" || targetAllowed == "mod") && !_svgDragLine.current) {
            return;
        }
        else {   //out
            connectionPoints.forEach(element => {
                let id = element.getAttribute("data-id");
                if (id == "out") {
                    element.setAttribute("data-allowed", "false");
                }
                else {
                    element.setAttribute("data-allowed", "true");
                }
            });
        }

        if (_svgDragLine.current) {
            if (target.getAttribute("data-id") == "out") {
                return;
            }

            if (!svgLines.find(e => (e.a == _svgDragLine.current?.a && e.b == target.getAttribute("data-key")!)
                || (e.a == target.getAttribute("data-synth-id")! && e.b == _svgDragLine.current?.a))) {
                //add synth-route
                let node2 = synth.audioNodes[target.getAttribute("data-synth-id")!].id;
                let node1 = synth.audioNodes[_svgDragLine.current.synth!].id;
                let type = "" + target.getAttribute("data-type");    //TODO: z.B. mod-pan or in-in
                if (node1 === undefined || node2 === undefined) {
                    console.error(`no nodes where found for: ${target.getAttribute("data-synth-id")}`);
                } else {
                    addRouteToSynth(node1, node2, type as ModType | undefined);
                }

                //add svg-line
                setSvgLines([...svgLines, {
                    x1: _svgDragLine.current.x1,
                    y1: _svgDragLine.current.y1,
                    x2: x - offsetX + target.clientWidth / 2,
                    y2: y - offsetY + target.clientHeight / 2,
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
            x1: x - offsetX + target.clientWidth / 2,
            y1: y - offsetY + target.clientHeight / 2,
            x2: ev.clientX - offsetX,
            y2: ev.clientY - offsetY,
            a: target.getAttribute("data-key")!,
            b: undefined,
            synth: target.getAttribute("data-synth-id")!
        };
        setSvgDragLine(_svgDragLine.current);
    }

    function addElementToSynth(ran: RoutableAudioNode) {
        if (synth.audioNodes[ran.id!]) {
            console.error("param id already exists!" + ran.id);
            return;
        }
        setProject(produce(draft => {
            draft.data.tracks[props.trackId].instrument.audioNodes[ran.id!] = ran;
        }));
    }

    function addRouteToSynth(id1: string, id2: string, type?: ModType) {
        insertRoute(id1, id2, synth.routes, type);
        /*setSyth(produce(draft => {
            draft.routes.insert(id1, id2, type);    //ERROR: Maybe make the insert method static? idk...
                                                    //       Routes can be set, but no methods of it can be executed...
                                                    //       Even routes.routes can be set...
        }));*/
    }

    function insertRoute(element1: string, element2: string, modRom: ModRoM, type?: ModType) {   //TODO: Try to add this back into modRom!
        let routes = modRom.routes;

        if (routes[element1]) {   //first element was already routed
            if (type) {
                setProject(produce(draft => {
                    draft.data.tracks[props.trackId].instrument.routes.routes[element1].children[element2 + "|" + type] = { type: type } as RouteModElement;
                }));
            }
            else {
                setProject(produce(draft => {
                    draft.data.tracks[props.trackId].instrument.routes.routes[element1].children[element2] = { children: {} } as RouteNodeElement;
                }));
            }
        }
        else {   //first element wasn't routed yet
            if (type) {
                setProject(produce(draft => {
                    draft.data.tracks[props.trackId].instrument.routes.routes[element1] = {
                        children: {
                            [element2 + "|" + type]: { type: type } as RouteModElement
                        }
                    };
                }));
            }
            else {
                setProject(produce(draft => {
                    draft.data.tracks[props.trackId].instrument.routes.routes[element1] = {
                        children: {
                            [element2]: { children: {} } as RouteNodeElement
                        }
                    };
                }));
            }
        }

        //console.warn("tried to insert "+element1+" into "+element2 + (type?(" on type: "+type):""));
    }

    function removeRoute(element1: string, element2: string, type?: ModType) {
        //TODO: Implement
    }

    useEffect(() => {
        //Do stuff on first load
    }, []);

    useEffect(() => {
        if (!mouseDown && draggedNode) {
            draggedNode.style.rotate = '0deg';
            draggedNode.setAttribute("data-grab", "none");
            setDraggedNode(undefined);
            return;
        }
    }, [mouseDown])

    useEffect(() => {
        if (mouseDown && hoverOverLine) {
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

            setProject(produce(draft => {
                let id = draggedNode.getAttribute('data-synth-id');
                if(id){
                    draft.data.tracks[props.trackId].instrument.audioNodes[id].x = left;
                    draft.data.tracks[props.trackId].instrument.audioNodes[id].y = top;
                }
            }));

            //update lines
            const connectors = Array.from(draggedNode.querySelectorAll(".audio-connection-node"));
            svgLines.forEach((l, idx) => {
                const connectorA = connectors.find(c => c.getAttribute('data-key') == l.a);
                const connectorB = connectors.find(c => c.getAttribute('data-key') == l.b);
                let newLines = [...svgLines];
                if (connectorA) {
                    const { x, y } = connectorA.getBoundingClientRect();
                    newLines[idx].x1 = x - offsetX + connectorA.clientWidth / 2;
                    newLines[idx].y1 = y - offsetY + connectorA.clientHeight / 2;
                }
                if (connectorB) {
                    const { x, y } = connectorB?.getBoundingClientRect();
                    newLines[idx].x2 = x - offsetX + connectorB.clientWidth / 2;
                    newLines[idx].y2 = y - offsetY + connectorB.clientHeight / 2;
                }
                setSvgLines(newLines);
            });
        }
    }, [mousePosition, mouseDelta])

    useEffect(() => {
        if (!_svgDragLine.current) return;
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
        () => {
            _svgDragLine.current = undefined;
            setSvgDragLine(undefined);
            resetDataAllowed();
        }
    }>

        <Allotment vertical={false} separator={true} proportionalLayout={false}>
            <Allotment.Pane priority={LayoutPriority.High} className="content">
                <ul ref={nodesDragOverlay}>
                    {Object.keys(synth.audioNodes).map(id => {
                        const audioNode = synth.audioNodes[id];
                        return <li key={`node[${id}]`} className='audionode'
                            onMouseDown={handleNodeMouseDown}
                            style={{ width: audioNode.width + "px", height: audioNode.height + "px", top: audioNode.y + "px", left: audioNode.x +"px"}}
                            data-type={audioNode.type}
                            data-drag="none"
                            data-synth-id={audioNode.id}>
                            {
                                audioNode.connectionpoints.map((connector, j) =>
                                    <div className="audio-connection-node" key={`node-connector[${id}${j}]`}
                                        onMouseDown={handleConnectionMouseClick}
                                        onMouseUp={handleConnectionMouseClick}
                                        data-id={connector.id}
                                        data-allowed={connector.id == "out" ? true : false}
                                        data-synth-id={audioNode.id}
                                        data-type={connector.type}
                                        data-key={`node-connector[${id}${j}]`}    //TODO: Use this to fix a serious bug
                                        style={{ top: connector.top + "px", left: connector.left + "px", bottom: connector.bottom + "px", right: connector.right + "px" }}>
                                    </div>
                                )
                            }
                            {
                                audioNode.modifiableproperties.map((prop, j) =>
                                    <div className="knobWrapper" key={`node-knob-wrappear[${id}${j}]`}
                                        style={{ position: "absolute", top: prop.top + "px", left: prop.left + "px", bottom: prop.bottom + "px", right: prop.right + "px" }}>
                                        <Knob className="knob" key={`node-knob[${id}${j}]`}
                                            value={prop.default}
                                            onChange={(val) => {
                                                setProject(produce(draft => {
                                                    const synth = draft.data.tracks[props.trackId].instrument;
                                                    AudioEngine.changeValue(synth, props.trackId, audioNode.type, prop.type, val, audioNode.id!)
                                                }));
                                            }}
                                            startingValue={prop.default}
                                            max={prop.max}
                                            min={prop.min}
                                            stepping={prop.stepping}
                                            steps={prop.steps}>
                                        </Knob>
                                    </div>
                                )
                            }
                        </li>
                    }
                    )}
                </ul>

                <svg className="connection-lines">
                    {svgDragLine && <line className="dragged-connection-line" x1={svgDragLine.x1} y1={svgDragLine.y1} x2={svgDragLine.x2} y2={svgDragLine.y2} stroke="black" strokeWidth="5" />}
                    {svgLines.map((l, i) => (
                        <line key={`connection-line[${i}]`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="black" strokeWidth="5" data-a={l.a} data-b={l.b}
                            className="placed-line"
                            onMouseEnter={(e) => {
                                setHoverOverLine(e.target as HTMLElement);
                            }}
                            onMouseLeave={() => {
                                setHoverOverLine(undefined);
                            }} />
                    ))}
                </svg>

                <Piano
                    trackId={props.trackId}
                    disabled={false}
                    orientation="horizontal" />
            </Allotment.Pane>

            <Allotment.Pane snap minSize={169.99} maxSize={170} preferredSize={170}>
                <div className="controls">
                    <button onClick={() => {
                        let node = defaultAudioEndNode();
                        const id = generateId(new Set(Object.keys(synth.audioNodes)));
                        node.id = id;
                        
                        addElementToSynth(node);
                    }}>
                        <div className="audionode" data-type="AudioEndNode" style={{ position: "unset" }} />
                        Add AudioEndNode
                    </button>
                    <button onClick={() => {
                        let node = defaultCompressorNode();
                        const id = generateId(new Set(Object.keys(synth.audioNodes)));
                        node.id = id;
                        
                        addElementToSynth(node);
                    }}>
                        <div className="audionode" data-type="Compressor" style={{ position: "unset" }} />
                        Add CompressorNode
                    </button>
                    <button onClick={() => {
                        let node = defaultOscillatorNode();
                        const id = generateId(new Set(Object.keys(synth.audioNodes)));
                        node.id = id;
                        
                        addElementToSynth(node);
                    }}>
                        <div className="audionode" data-type="Oscillator" style={{ position: "unset" }} />
                        Add Oscillator
                    </button>
                </div>
            </Allotment.Pane>
        </Allotment>
    </section>)
}