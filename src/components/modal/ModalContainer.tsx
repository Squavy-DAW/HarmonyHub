import { createRef, useEffect } from "react"

export default function ModalContainer(props: React.HTMLAttributes<HTMLDivElement> & {
    mode: 'fill' | 'center'
}) {
    const ref = createRef<HTMLDivElement>();

    useEffect(() => {
        // thanks, firefox >:(
        // just. for. you.
        const refCapture = ref.current!;
        const interval = setInterval(() => {
            const el = refCapture.closest<HTMLDivElement>('.ReactModal__Content')
            el?.classList.add(props.mode);
        }, 5);

        return () => {
            clearInterval(interval);
        }
    }, [])

    return (
        <div ref={ref} {...props} />
    )
}