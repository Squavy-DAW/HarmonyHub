import React from "react";
import { useEffect } from "react";
import "@styles/NumberUpDown.css";
import useMouse from "@src/hooks/mouse";

export interface NumberUpDownProps extends Omit<React.HTMLProps<HTMLInputElement>, "onChange"> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export default function NumberUpDown({ value, min, max, step, onChange, ...rest }: NumberUpDownProps) {

    const [_value, _setValue] = React.useState(value);
    const [_mouseDown, _setMouseDown] = React.useState(false);
    const [mouseDownOrigin, setMouseDownOrigin] = React.useState({ value: 0, x: 0, y: 0 });

    const { mousePosition, mouseDown } = useMouse();

    function handlePlus() {
        if (max && _value >= max) return;
        _setValue(_value + 1);
    }

    function handleMinus() {
        if (min && _value <= min) return;
        _setValue(_value - 1);
    }

    useEffect(() => {
        onChange(_value);
    }, [_value]);

    useEffect(() => {
        if (!_mouseDown) return;
        const diff = mouseDownOrigin.y - mousePosition.y;
        const newValue = mouseDownOrigin.value + Math.floor(diff / 10);
        if (max && newValue > max || min && newValue < min) return;
        _setValue(newValue);
    }, [mousePosition])

    useEffect(() => {
        if (!mouseDown) {
            _setMouseDown(false);
        }
    }, [mouseDown])

    return (
        <div className="number-up-down">
            <p {...rest} onMouseDown={(ev) => {
                setMouseDownOrigin({ value: _value, x: ev.clientX, y: ev.clientY });
                _setMouseDown(true);
            }} className={[
                "value",
                max && _value >= max ? "max" : "",
                min && _value <= min ? "min" : ""
            ].join(' ')}>{_value}</p>
            <button onClick={handlePlus} disabled={max ? _value >= max : false}>+</button>
            <button onClick={handleMinus} disabled={min ? _value <= min : false}>-</button>
        </div>
    )
}