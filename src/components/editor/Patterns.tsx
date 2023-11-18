import MidiEditor from "@components/editor/MidiEditor";
import Pattern from "@models/pattern";
import { broadcast, handle, survey } from "@network/sessions";
import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
// import MouseMoveContext from "@src/context/mousemove";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import { useSignal } from "@src/hooks/signal";
import { useContext, useEffect, useState } from "react";
import { produce } from "immer"

export default function Patterns(props: { overlay: React.RefObject<HTMLDivElement> }) {

    const [patterns, setPatterns, getPatterns] = useSignal<{ [name: string]: Pattern }>({});
    const [newPatternName, setNewPatternName] = useState<string>('');
    const { project, setProject } = useContext(ProjectContext);
    const [draggedPattern, setDraggedPattern] = useState<HTMLElement>();
    // const { mousePosition, mouseDelta, mouseDown } = useContext(MouseMoveContext);

    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const { socket, cryptoKey } = useContext(NetworkContext);

    const { setModalContent } = useContext(ModalContext);

    function handlePatternClick(patternName: string) {
        setModalContent(
            <MidiEditor pattern={patternName} />
        )
    }

    function handlePatternMouseDown(ev: React.MouseEvent) {
        const clone = ev.currentTarget.cloneNode(true) as HTMLElement;
        props.overlay.current!.append(clone);
        setDraggedPattern(clone);
    }

    async function handleNewPattern(ev: React.MouseEvent) {
        if (!newPatternName) return;
        if (!patterns[newPatternName]) {
            // if the socket exists, but the survey fails, then we don't want to add the pattern
            if (socket && !await survey(socket, cryptoKey!, 'hh:survey-pattern', { pattern: newPatternName })) {
                return;
            }

            setPatterns(produce(draft => {
                draft[newPatternName] = {
                    color: '#000000',
                    data: {},
                    locked: false,
                }
            }))

            if (socket) {
                // notify other clients that a new pattern has been created
                broadcast(socket, cryptoKey!, 'hh:pattern-created', { pattern: newPatternName });
            }
        }
    }

    useEffect(() => {
        setPatterns(project.data.patterns);
    }, [])

    useEffect(() => {
        if (socket) {
            handle(socket, cryptoKey!, 'hh:survey-pattern', (_id, { pattern }) => {
                console.log('survey-pattern', getPatterns());

                return !getPatterns()[pattern];
            })

            handle(socket, cryptoKey!, 'hh:pattern-created', (_id, { pattern }) => {
                setPatterns(produce(draft => {
                    draft[pattern] = {
                        color: '#000000',
                        data: {},
                        locked: false,
                    }
                }))
            })
        }
    }, [socket])

    useEffect(() => {
        if (project) {
            setProject(produce(draft => {
                draft.data.patterns = patterns;
            }));
        }
    }, [patterns])

    useEffect(() => {
        if (!mouseDown && draggedPattern) {
            const element = draggedPattern;
            element.classList.add('dropped');
            setTimeout(() => {
                element.remove();
            }, 200);
            return;
        }
    }, [mouseDown])

    useEffect(() => {
        if (draggedPattern) {
            draggedPattern.classList.add('active');
            const left = mousePosition.x - props.overlay.current!.getBoundingClientRect().x
            const top = mousePosition.y - props.overlay.current!.getBoundingClientRect().y
            draggedPattern.style.left = `${left}px`;
            draggedPattern.style.top = `${top}px`;
            draggedPattern.style.rotate = `${Math.min(Math.max(mouseDelta.x, -30), 30)}deg`;
        }
    }, [mousePosition, mouseDelta])

    return (
        <section className='music-patterns'>
            <ul>
                {Object.keys(patterns).map((name, i) =>
                    <li key={`pattern[${i}]`} className='pattern'
                        onClick={() => handlePatternClick(name)}
                        onMouseDown={handlePatternMouseDown}>
                        {name}
                    </li>
                )}
            </ul>
            <div className='controls'>
                <button className='control add-pattern' onClick={handleNewPattern} disabled={!newPatternName || !!patterns[newPatternName]} />
                <input className='control new-pattern-name' type="text" value={newPatternName}
                    onChange={(ev) => setNewPatternName(ev.target.value)}
                    onKeyPress={(ev) => ev.key == 'Enter' && handleNewPattern(ev as any)} />
            </div>
        </section>
    )
}