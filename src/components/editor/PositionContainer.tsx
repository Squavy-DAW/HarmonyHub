import PositionContext from "@src/context/positioncontext"
import { useContext } from "react"

export default function PositionContainer(props: React.PropsWithChildren<{}>) {

    const { position } = useContext(PositionContext);

    return (
        <div {...props} style={{ position: 'absolute', left: -position }} />
    )
}