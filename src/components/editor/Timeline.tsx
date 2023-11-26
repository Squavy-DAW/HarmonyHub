import { zoomBase } from "@models/project";
import PositionContext from "@src/context/positioncontext";
import ZoomContext from "@src/context/zoomcontext";
import { slipCeil, slipFloor } from "@src/scripts/math";
import "@styles/editor/Timeline.css";
import { useContext } from "react";

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
    offset?: number
}

export default function Timeline(props: TimelineProps) {

    const { factor } = useContext(ZoomContext);
    const { position } = useContext(PositionContext);

    const offset = (props.offset ?? 0);

    function timelinePointSizingFunction(num: number) {
        return Math.sqrt(1 - num ** 2);
    }

    return (
        <ul className="timeline" {...props}>
            {(() => {
                const timeline: Array<{ time: number, size: number }> = [];
                const diff = window.innerWidth / factor;
                const distance = diff / 8;
                const nearest = Math.pow(2, Math.floor(Math.log2(distance)));
                // console.log(
                //     `distance: ${distance.toFixed(4)}`,
                //     `floorPow2: ${nearest}`,
                //     `size: ${(1-(distance-nearest)/nearest).toFixed(4)}`
                // );
                
                const start = slipFloor((position - window.innerWidth + offset) / factor, nearest);
                const end = slipCeil((position + window.innerWidth * 2) / factor, nearest);

                for (let i = start - nearest; i < end; i += nearest) {
                    timeline.push({
                        time: i,
                        size: i % (nearest * 2) == 0 ? 1 : timelinePointSizingFunction((distance - nearest) / nearest),
                    });
                }

                return timeline.map(({ time, size }) => {
                    return <li key={time} className="timeline-item" style={{
                        left: time * factor - position + offset,
                        fontSize: `${size / 2 + 0.5}rem`,
                        opacity: `${size}`
                    }}>
                        {(parseFloat(time.toFixed(2)))}s
                    </li>
                });
            })()}
        </ul>
    )
}