import MidiEditor from "@components/editor/MidiEditor";
import { broadcast, handle } from "@network/sessions";
import ModalContext from "@src/context/modalcontext";
import NetworkContext from "@src/context/networkcontext";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import { forwardRef, useContext, useEffect, useState } from "react";
import { produce } from "immer"
import Pattern from "@models/pattern";
import { generateId } from "@network/crypto";
import DraggedPatternContext from "@src/context/draggedpatterncontext";
import ModalContainer from "@components/modal/ModalContainer";

export default function Patterns(props: { overlay: React.RefObject<HTMLDivElement> }) {
    const { project, setProject } = useContext(ProjectContext);
    const { socket, cryptoKey } = useContext(NetworkContext);
    const { setModalContent } = useContext(ModalContext);
    const { draggedPattern, setDraggedPattern } = useContext(DraggedPatternContext);

    const [newPatternName, setNewPatternName] = useState<string>('');
    const { mousePosition, mouseDelta, mouseDown } = useMouse();

    function handlePatternClick(ev: React.MouseEvent) {
        const id = ev.currentTarget.getAttribute('data-id')!;
        setModalContent(
            <ModalContainer mode="fill">
                <MidiEditor patternId={id} />
            </ModalContainer>
        )
    }

    function handlePatternMouseDown(ev: React.MouseEvent) {
        const id = ev.currentTarget.getAttribute('data-id')!;
        const pattern = project.data.patterns[id];
        setDraggedPattern({
            ...pattern,
            id: id,
            left: ev.clientX,
            top: ev.clientY,
            rotate: 0
        });
    }

    async function handleNewPattern(_ev: React.MouseEvent) {
        if (!newPatternName) return;
        const id = generateId(new Set(Object.keys(project.data.patterns)));
        const pattern: Pattern = {
            name: newPatternName,
            color: '#000000',
            locked: false,
            notes: {}
        };

        setProject(produce(draft => {
            draft.data.patterns[id] = pattern;
        }));

        if (socket) {
            // notify other clients that a new pattern has been created
            broadcast(socket, cryptoKey!, 'hh:pattern-created', { id: id, pattern: pattern });
        }
    }

    useEffect(() => {
        if (socket) {
            handle(socket, cryptoKey!, 'hh:pattern-created', (_id, { id, pattern }) => {
                setProject(produce(draft => {
                    draft.data.patterns[id] = pattern;
                }));
            });
        }
    }, [socket])

    useEffect(() => {
        if (!mouseDown && draggedPattern) {
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.dropped = true;
            }));
            return;
        }
    }, [mouseDown])

    useEffect(() => {
        if (draggedPattern) {
            setDraggedPattern(produce(draft => {
                if (!draft) return;
                draft.active = true;
                draft.left = mousePosition.x - props.overlay.current!.getBoundingClientRect().left;
                draft.top = mousePosition.y - props.overlay.current!.getBoundingClientRect().top;
                draft.rotate = mouseDelta.x;
            }));
        }
    }, [mousePosition, mouseDelta])

    return (
        <section className='music-patterns'>
            <ul>
                {Object.keys(project.data.patterns).map(id => {
                    const pattern = project.data.patterns[id];
                    return (
                        <li key={`pattern[${id}]`} className='pattern'
                            data-id={id}
                            onClick={handlePatternClick}
                            onMouseDown={handlePatternMouseDown}>
                            <span className="pattern-name">
                                {project.data.patterns[id].name}
                            </span>
                        </li>
                    )
                })}
            </ul>
            <div className='controls'>
                <button className='add-pattern' onClick={handleNewPattern} disabled={!newPatternName} />
                <input className='new-pattern-name' type="text" value={newPatternName}
                    onChange={(ev) => setNewPatternName(ev.target.value)}
                    onKeyPress={(ev) => ev.key == 'Enter' && handleNewPattern(ev as any)} />
            </div>
        </section>
    )
}

export const PatternDragOverlay = forwardRef(function (props: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) {

    const { draggedPattern } = useContext(DraggedPatternContext);
    const { project } = useContext(ProjectContext);

    return (
        <div className="pattern-drag-overlay" ref={ref} {...props}>
            {draggedPattern && <li
                className={['pattern',
                    draggedPattern.active ? 'active' : null,
                    draggedPattern.dropped ? 'dropped' : null,
                    draggedPattern.over ? 'over' : null
                ].join(' ')}
                style={{
                    left: draggedPattern.left,
                    top: draggedPattern.top,
                    rotate: `${Math.min(Math.max(draggedPattern.rotate, -30), 30)}deg`,
                }}>
                {/* Pattern preview */}
            </li>}
        </div>
    )
})