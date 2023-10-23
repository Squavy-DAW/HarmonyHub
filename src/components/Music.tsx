import { Session } from "@models/Session";
import Split from "react-split";
import '@styles/Music.css';

export default function Music({session}: {session: Session}) {

    const { peer } = session;

    return (
        <Split id="music-layout"
            sizes={[70, 30]}
            minSize={100}
            gutterSize={5}
            snapOffset={20}
            gutterAlign=''
            direction="vertical"
            cursor="row-resize">
                <section id="music-notes">
                    <section id="mouse-cursors"></section>
                </section>
                <section />
        </Split>
    )
}