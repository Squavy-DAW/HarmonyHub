import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
 
export function useSignal<S>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>, () => S | undefined];
export function useSignal<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>, () => S];
export function useSignal(initialState?: any) {
    const [value, setValue] = useState(initialState);
    const ref = useRef<any>();
    ref.current = value;

    useEffect(() => {
        ref.current = value;
    }, [value]);

    const getValue = () => {
        return ref.current;
    }

    return [value, setValue, getValue];
}