import React, { useState, useEffect } from 'react';
import "@styles/synthesizer/Knob.css";
import useMouse from '@src/hooks/mouse';

interface KnobProps extends Omit<React.HTMLProps<HTMLInputElement>, "onChange">{
    startingValue: number;
    min: number;
    max: number;
    steps?: number[];
    snappingSensitivity?: number;
    stepping: boolean;
    onChange: (value: number) => void;
}

export default function Knob({ startingValue, min, max, steps, onChange, stepping, snappingSensitivity, ...rest }: KnobProps) {
    const [value, setValue] = useState(startingValue);
    const [rawValue, setRawValue] = useState(startingValue);
    const [isDragging, setIsDragging] = useState(false);
    const [initialY, setInitialY] = useState(0);
    const [grabbing, setGrabbing] = useState('grab');

    const { mousePosition, mouseDown } = useMouse();

    if(steps && snappingSensitivity && stepping) snappingSensitivity = Math.min(findClosestDistance(steps) ? (findClosestDistance(steps)! - 1) / 10 : 1, snappingSensitivity);

    if(!steps?.includes(min)) steps?.push(min);
    if(!steps?.includes(max)) steps?.push(max);

    useEffect(() => {
      if (isDragging) {
        const delta = mousePosition.y - initialY;
        //POI: Magic number that just works.
        const sensitivity = (max-min) *.01

        if (stepping && steps) {
            const newValue = Math.max(min, Math.min(rawValue - delta, max));
            let roundedValue = value;
            

            steps.forEach(element => {
                if(Math.abs(newValue - element) <= (10 * (snappingSensitivity ? snappingSensitivity : 1))){
                    roundedValue = element;
                }
            });

            setRawValue(newValue);

            if(roundedValue != value){
                setValue(Number(roundedValue.toFixed(3)));
                onChange(Number(roundedValue.toFixed(3)));
            }
            setInitialY(mousePosition.y);
        } else {
            const newValue = Math.max(min, Math.min(value - delta * sensitivity, max));
            setValue(Number(newValue.toFixed(3)));
            onChange(Number(newValue.toFixed(3)));
            setInitialY(mousePosition.y);
        }
    }
    }, [mousePosition.y])

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
        document.body.style.userSelect = 'none';
        setGrabbing('grabbing');
        event.stopPropagation();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setGrabbing('grab');
        document.body.style.userSelect = '';
    };

    useEffect(() => {
      if(isDragging){
        document.addEventListener('mouseup', handleMouseUp)
      }else {
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging])

    return (
        <div
            className="knob"
            onMouseDown={handleMouseDown}
            style={{
                transform: `rotate(${((value - min) / (max - min)) * 180 + 45}deg)`,
                cursor: `${grabbing}`,
            }}
            {...rest}
        >
            {/*Quick fix to stop the text from rotating*/}
            <div className="knob-handle" style={{transform: `rotate(-${((value - min) / (max - min)) * 180 + 45}deg)`}}>
              <p>{value.toFixed(2)}</p>
            </div>
        </div>
    );
};