import React, { useState, useEffect } from 'react';
import "@styles/synthesizer/Knob.css";
import useMouse from '@src/hooks/mouse';

interface KnobProps extends Omit<React.HTMLProps<HTMLInputElement>, "onChange" | "value"> {
    min: number;
    max: number;
    steps?: number[];
    snappingSensitivity?: number;
    stepping: boolean;
    value?: number;
    onChange: (value: number) => void;
}

export default function Knob({ value, min, max, steps, onChange, stepping, snappingSensitivity, ...rest }: KnobProps) {
    const [_value, setValue] = useState(value ?? min);
    const [rawValue, setRawValue] = useState(value ?? min);
    const [isDragging, setIsDragging] = useState(false);
    const [initialY, setInitialY] = useState(0);
    const [grabbing, setGrabbing] = useState('grab');

    const { mousePosition } = useMouse();
    const closestDist = findClosestDistance(steps ? steps : [0]);

    if (steps && stepping) snappingSensitivity = Math.min(closestDist ? (closestDist! - closestDist/10) / 10 : 1, snappingSensitivity ? snappingSensitivity : 1);

    if (!steps?.includes(min)) steps?.push(min);
    if (!steps?.includes(max)) steps?.push(max);

    useEffect(() => {
        if (isDragging) {
            const delta = mousePosition.y - initialY;
            //POI: Magic number that just works.
            const sensitivity = (max - min) * .01

            if (stepping && steps) {
                const newValue = Math.max(min, Math.min(rawValue - delta * sensitivity, max));
                let roundedValue = _value;


                steps.forEach(element => {
                    //console.log(`element: ${element}, distance: ${Math.abs(newValue - element)}, requiredDist: ${(10 * (snappingSensitivity ? snappingSensitivity : 1))}, sens: ${snappingSensitivity} `)
                    if (Math.abs(newValue - element) <= (10 * (snappingSensitivity ? snappingSensitivity : 1))) {
                        roundedValue = element;
                    }
                });

                //console.log(`rawVal: ${newValue}, roundedVal: ${roundedValue}`)

                setRawValue(newValue);

                if (roundedValue != value) {
                    setValue(Number(roundedValue.toFixed(3)));
                    onChange(Number(roundedValue.toFixed(3)));
                }
                setInitialY(mousePosition.y);
            } else {
                const newValue = Math.max(min, Math.min(_value - delta * sensitivity, max));
                setValue(Number(newValue.toFixed(3)));
                onChange(Number(newValue.toFixed(3)));
                setInitialY(mousePosition.y);
            }
        }
    }, [mousePosition.y])

    useEffect(() => {
        setValue(value ?? min);
    }, [value])

    function findClosestDistance(numbers: number[]): number | null {
        if (numbers.length < 2) {
            return null;
        }

        const sortedNumbers = numbers.slice().sort((a, b) => a - b);
        let minDistance = sortedNumbers[1] - sortedNumbers[0];

        for (let i = 2; i < sortedNumbers.length; i++) {
            const currentDistance = sortedNumbers[i] - sortedNumbers[i - 1];
            minDistance = Math.min(minDistance, currentDistance);
        }

        return minDistance;
    }

    const handleMouseDown = (event: React.MouseEvent) => {
        setIsDragging(true);
        setInitialY(event.clientY);
        
        setGrabbing('grabbing');
        event.stopPropagation();
        document.body.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setGrabbing('grab');

        document.body.style.userSelect = '';
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mouseup', handleMouseUp)
        } else {
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div
            {...rest}
            className={["knob", rest.className].join(' ')}
            onMouseDown={handleMouseDown}
            style={{
                transform: `rotate(${((_value - min) / (max - min)) * 180 + 45}deg)`,
                cursor: `${grabbing}`,
                ...rest.style
            }}>
            {/*Quick fix to stop the text from rotating*/}
            <div className="knob-handle" style={{ transform: `rotate(-${((_value - min) / (max - min)) * 180 + 45}deg)` }}>
                <p>{_value.toFixed(2)}</p>
            </div>
        </div>
    );
};