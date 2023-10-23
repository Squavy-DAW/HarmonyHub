import Session from "@models/Session";
import Split from "react-split";

export default function Music({session}: {session: Session}) {

    const { peer } = session;

    return (
        <Split
            sizes={[70, 30]}
            minSize={100}
            gutterSize={1}
            snapOffset={20}
            gutterAlign=''
            direction="vertical"
            cursor="row-resize">
                <section>
                    <h1>{session.name}</h1>
                </section>
                <section />
        </Split>
    )
}