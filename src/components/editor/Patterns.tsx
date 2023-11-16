import MidiEditor from "@components/editor/MidiEditor";
import Pattern from "@models/pattern";
import EditingPatternContext from "@src/context/editingpattern";
import ModalContext from "@src/context/modalcontext";
// import MouseMoveContext from "@src/context/mousemove";
import ProjectContext from "@src/context/projectcontext";
import useMouse from "@src/hooks/mouse";
import { useContext, useEffect, useState } from "react";

export default function Patterns(props: { overlay: React.RefObject<HTMLDivElement> }) {

    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const { project } = useContext(ProjectContext);
    const [draggedPattern, setDraggedPattern] = useState<HTMLElement>();
    // const { mousePosition, mouseDelta, mouseDown } = useContext(MouseMoveContext);

    const { mousePosition, mouseDelta, mouseDown } = useMouse();

    const { setModalContent } = useContext(ModalContext);
    const { editingPattern, setEditingPattern } = useContext(EditingPatternContext);

    function handlePatternClick(pattern: Pattern) {
        setEditingPattern(pattern);
        setModalContent(
            <MidiEditor pattern={pattern} />
        )
    }

    function handlePatternMouseDown(ev: React.MouseEvent) {
        const clone = ev.currentTarget.cloneNode(true) as HTMLElement;
        props.overlay.current!.append(clone);
        setDraggedPattern(clone);
    }

    useEffect(() => {
        if (!editingPattern) return;
        setPatterns(prev => {
            const index = prev.findIndex(p => p.name === editingPattern.name);
            const newPatterns = [...prev];
            newPatterns[index] = editingPattern;
            return newPatterns;
        })
    }, [editingPattern])

    useEffect(() => {
        if (project && project.data.patterns) {
            setPatterns(project.data.patterns);
        }
    }, [project])

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
                {patterns?.map((pattern, i) =>
                    <li key={`pattern[${i}]`} className='pattern' onClick={() => {
                        handlePatternClick(pattern);
                    }}
                        onMouseDown={handlePatternMouseDown}>
                        {pattern.name}
                    </li>
                )}
            </ul>
            <div className='controls'>
                <button className='control' onClick={() => {
                    setPatterns([...patterns ?? [], {
                        name: 'New Pattern',
                        color: '#000000',
                        data: {}
                    }])
                }}>
                    <img src="/src/assets/pattern/new.png" alt="add new pattern" />
                </button>
            </div>
        </section>
    )
}