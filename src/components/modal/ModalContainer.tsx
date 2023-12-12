import { createRef, useEffect, useState } from "react"

export default function ModalContainer(props: React.HTMLAttributes<HTMLDivElement> & {
    mode: 'fill' | 'center'
}) {
    const ref = createRef<HTMLDivElement>();
    const [active, setActive] = useState(false);

    useEffect(() => {
        // thanks, firefox >:(
        // just. for. you.
        const refCapture = ref.current!;
        
        const interval = setInterval(() => {
            const el = refCapture.closest<HTMLDivElement>('.ReactModal__Content')
            el?.classList.add(props.mode);
            setActive(true);
        }, 5);

        return () => {
            clearInterval(interval);
        }
    }, [])

    return (
        <div ref={ref} {...props} style={{
            visibility: active ? 'visible' : 'hidden',
        }} />
    )
}