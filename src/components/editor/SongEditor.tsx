import SynthEditor from "@components/synthesizer/SynthEditor";
import ModalContext from "@src/context/modalcontext";
import { createRef, useContext } from "react";

export default function SongEditor() {

    const { setModalContent } = useContext(ModalContext);

    return (<>
        <h1>Song editor</h1>
        <button onClick={() => {
                        setModalContent(
                            <SynthEditor/>
                        )
                    }}
                    >
            Temporary Synth Editor
        </button>
    </>)
}