import { useEffect, useState } from 'react';
import "../../styles/synthesizer/Knob.css"
import useMouse from '@src/hooks/mouse';


export interface KnobProps extends Omit<React.HTMLProps<HTMLInputElement>, "onChange"> {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}


export default function Knob({value, onChange, min, max, step, ...rest} : KnobProps) {
  const [mousePositionOrigin, setMousePositionOrigin] = useState({ x:0, y:0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [_value, _setValue] = useState(value);
  
  const { mousePosition, mouseDown } = useMouse();
  
  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

  useEffect(() => {
    if(!isMouseDown){
      onChange(_value); 
    }
  }, [isMouseDown]);
    
  useEffect(() => {
    if(!mouseDown){
      setIsMouseDown(false);  
    }
  }, [mouseDown])  
  
  useEffect(() => {
    if(!isMouseDown) return;
    let tval = _value + (mousePosition.y - mousePositionOrigin.y)*-1;
    
    _setValue(clamp(tval, min ? min : 0, max ? max : 180)) 
    setMousePositionOrigin({x: mousePosition.x, y: mousePosition.y});  
  }, [mousePosition])

  return (
    <div {...rest} onMouseDown={
      (e) => {
        setMousePositionOrigin({x: e.clientX, y: e.clientY});  
        setIsMouseDown(true); 
      }
    } className='knob' style={{transform: `rotate(${_value * 2}deg)`}}>
    </div>
  );
}
