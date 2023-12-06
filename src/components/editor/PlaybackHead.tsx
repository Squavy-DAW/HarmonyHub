import PlaybackContext from "@src/context/playbackcontext";
import PositionContext from "@src/context/positioncontext";
import ZoomContext from "@src/context/zoomcontext";
import "@styles/editor/PlaybackHead.css";
import { useContext } from "react";

export default function PlaybackHead({...rest}: React.HTMLAttributes<HTMLDivElement>) {

    const { position } = useContext(PositionContext);
    const { factor } = useContext(ZoomContext);
    const { time, isPlaying } = useContext(PlaybackContext);

    return (
        <div {...rest} className={["playback-head", rest.className].join(' ')}>
            <div className={["head", isPlaying ? "playing" : null].join(' ')} style={{
            left: time * factor - position
        }} />
        </div>
    );
}