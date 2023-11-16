import React, { useEffect, useRef, useState } from 'react';
import "../../styles/synthesizer/Knob.css"

interface Props {
  max: number;
  min: number;
}

export default function Knob(props: Props) {
    const [mousePosition, setMousePosition] = useState({ x:0, y:0 });
    const [mousePositionOld, setMousePositionOld] = useState({ x:0, y:0 });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [value, setValue] = useState(10);
    
    useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
        if (divRef.current) {
          const rect = divRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width /2;
          const y = event.clientY - rect.top - rect.height /2;
          setMousePosition({ x, y });
        }
      };
      
      document.addEventListener('mousedown', (event: MouseEvent) => {
        if (divRef.current) {
          const rect = divRef.current.getBoundingClientRect();
          if(event.clientX - rect.left < 0 || event.clientX - rect.left > rect.width) return false;
          if(event.clientY - rect.top < 0 || event.clientY - rect.top > rect.height) return false;

          setIsMouseDown(true);
        }
      });
      document.addEventListener('mouseup', () => setIsMouseDown(false));
      document.addEventListener('mousemove', handleMouseMove);

    }, [])

    useEffect(() => {
      //Keine ahnung warum hier, aber es geht :)
      setMousePositionOld({x:mousePosition.x,y:mousePosition.y});

      if(isMouseDown){
        setValue(value + (mousePosition.y - mousePositionOld.y)*-1);
        console.log(`x: ${mousePosition.x}, y: ${mousePosition.y}, y_old: ${mousePositionOld.y}`)
      }
    }, [mousePosition])

    const divRef = useRef<HTMLDivElement>(null);
    
    return (
      <div ref={divRef} className='knob' style={{transform: `rotate(${value * 2}deg)`}}>
      </div>
    )
}
