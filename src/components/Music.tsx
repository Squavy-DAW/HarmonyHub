import Split from "react-split";

export default function Music() {
    return (
        <Split
            sizes={[70, 30]}
            minSize={100}
            gutterSize={1}
            snapOffset={20}
            gutterAlign=''
            direction="vertical"
            cursor="row-resize">
                <section />
                <section />
        </Split>
    )
}