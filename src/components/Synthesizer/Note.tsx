import '@styles/note.css';

export interface NoteProps{
    keyName:string,
    frequency:number,
    onMouseEnter:(e: React.MouseEvent)=>void,
    onMouseLeave:(e: React.MouseEvent)=>void,
    onMouseDown:(e: React.MouseEvent)=>void,
}

export default function Note(props:NoteProps) {

    function getClassName(kname:string){
        if(kname.endsWith("#"))
            return "black-key";
        return "white-key";
    }

    return (
        <div onMouseLeave={props.onMouseLeave} 
                onMouseEnter={props.onMouseEnter}
                onMouseUp={props.onMouseLeave}
                onMouseDown={props.onMouseDown}
                data-key-name={props.keyName}
                className={
                    getClassName(props.keyName)+ " key " + ((props.keyName.charAt(0)=='C' || props.keyName.charAt(0)=='F') ? "c-f" : 
                    (props.keyName.charAt(0)=='E' || props.keyName.charAt(0)=='B') ? "e-b" : "general")
                    }
                id={"freq:"+props.frequency}>
        </div>
    )
}
