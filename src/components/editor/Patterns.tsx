import MidiEditor from "@components/editor/MidiEditor";
import { broadcast, handle } from "@network/sessions";
import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
// import MouseMoveContext from "@src/context/mousemove";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import { useContext, useEffect, useState } from "react";
import { produce } from "immer"
import Pattern from "@models/pattern";

export default function Patterns(props: { overlay: React.RefObject<HTMLDivElement> }) {
    const [newPatternName, setNewPatternName] = useState<string>('');
    const { project, setProject } = useContext(ProjectContext);
    const [draggedPattern, setDraggedPattern] = useState<HTMLElement>();
    // const { mousePosition, mouseDelta, mouseDown } = useContext(MouseMoveContext);

    const { mousePosition, mouseDelta, mouseDown } = useMouse();
    const { socket, cryptoKey } = useContext(NetworkContext);

    const { setModalContent } = useContext(ModalContext);

    function handlePatternClick(ev: React.MouseEvent) {
        const index = parseInt(ev.currentTarget.getAttribute('data-index')!);
        setModalContent(
            <MidiEditor patternIndex={index} />
        )
    }

    function handlePatternMouseDown(ev: React.MouseEvent) {
        const clone = ev.currentTarget.cloneNode(true) as HTMLElement;
        props.overlay.current!.append(clone);
        setDraggedPattern(clone);
    }

    async function handleNewPattern(_ev: React.MouseEvent) {
        if (!newPatternName) return;
        const pattern: Pattern = {
            name: newPatternName,
            color: '#000000',
            locked: false,
            data: [],
        };

        setProject(produce(draft => {
            draft.data.patterns.push(pattern);
        }));

        if (socket) {
            // notify other clients that a new pattern has been created
            broadcast(socket, cryptoKey!, 'hh:pattern-created', { pattern: pattern });
        }
    }

    useEffect(() => {
        if (socket) {
            handle(socket, cryptoKey!, 'hh:pattern-created', (_id, { pattern }) => {
                setProject(produce(draft => {
                    draft.data.patterns.push(pattern);
                }));
            })
        }
    }, [socket])

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
                {project.data.patterns.map((pattern, i) =>
                    <li key={`pattern[${i}]`} className='pattern'
                        data-index={i}
                        onClick={handlePatternClick}
                        onMouseDown={handlePatternMouseDown}>
                        {pattern.name}
                    </li>
                )}
            </ul>
            <div className='controls'>
                <button className='control add-pattern' onClick={handleNewPattern} disabled={!newPatternName /*|| !!patterns[newPatternName]*/} />
                <input className='control new-pattern-name' type="text" value={newPatternName}
                    onChange={(ev) => setNewPatternName(ev.target.value)}
                    onKeyPress={(ev) => ev.key == 'Enter' && handleNewPattern(ev as any)} />
            </div>
        </section>
    )
}