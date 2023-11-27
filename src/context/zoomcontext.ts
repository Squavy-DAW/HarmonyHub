import React from "react";

interface ZoomContextProps {
    zoom: number;
    factor: number;
}

const ZoomContext = React.createContext<ZoomContextProps>({ zoom: 0, factor: 0 });
export default ZoomContext;