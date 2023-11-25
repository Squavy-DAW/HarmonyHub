import { zoomBase } from "@models/project";
import { slipCeil, slipFloor } from "@src/scripts/math";
import "@styles/editor/Timeline.css";

export default function Timeline(props: { zoom: number, position: number }) {

    const factor = zoomBase * Math.E ** props.zoom;

    function timelinePointSizingFunction(num: number) {
        return Math.sqrt(1 - num ** 2);
    }

    return (
        <ul className="timeline">
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

                const start = slipFloor((props.position - window.innerWidth) / factor, nearest);
                const end = slipCeil((props.position + window.innerWidth * 2) / factor, nearest);

                for (let i = start - nearest; i < end; i += nearest) {
                    timeline.push({
                        time: i,
                        size: i % (nearest * 2) == 0 ? 1 : timelinePointSizingFunction((distance - nearest) / nearest),
                    });
                }

                return timeline.map(({ time, size }) => {
                    return <li key={time} className="timeline-item" style={{
                        left: time * factor - props.position,
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