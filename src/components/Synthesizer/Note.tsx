import { startFreq, stopFreq }  from "@src/synth/engine";

export interface NoteProps{
    frequency:number,
    keyName:string
}

export default function Note(props:NoteProps) {

    return (
        <button onMouseDown={()=>startFreq(props.frequency)}
                onMouseLeave={()=>stopFreq(props.frequency)} 
                onMouseUp={()=>stopFreq(props.frequency)}>
            {props.keyName}
        </button>
    )
}
