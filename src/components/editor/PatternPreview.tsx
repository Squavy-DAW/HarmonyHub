import ProjectContext from "@src/context/projectcontext";
import { useContext } from "react";
import "@styles/editor/PatternPreview.css";
import ZoomContext from "@src/context/zoomcontext";

export default function PatternPreview(props: {id: string}) {

    const { project } = useContext(ProjectContext);
    const { factor } = useContext(ZoomContext);

    const pattern = project.data.patterns[props.id];
    const min = Math.min(...Object.keys(pattern.notes).map(id => pattern.notes[id].pitch), 8*12);
    const max = Math.max(...Object.keys(pattern.notes).map(id => pattern.notes[id].pitch), 0);
    const height = Math.max(max-min+1, 10);
    const length = pattern.length*factor;

    return (
        <svg className="pattern-preview" viewBox={`0 ${min} ${length} ${height}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {Object.keys(pattern.notes).map(id => {
                const note = { ...pattern.notes[id] };

                if (note.length < 0) {
                    note.start += note.length;
                    note.length *= -1;
                }

                return (
                    <rect key={id} x={note.start*factor} y={note.pitch} width={note.length*factor} height={1} />
                )
            })}
        </svg>
    )
}