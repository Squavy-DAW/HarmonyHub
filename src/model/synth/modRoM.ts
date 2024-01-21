export type ModType = "Pan" | "Gain" | "Unison" | "Phase" | "Detune" | "Waveform" | "Threshold" | "Ratio" | "None";

interface RouteElement{}

export interface RouteNodeElement extends RouteElement{
    children: {[id: string]:RouteElement}
}

export interface RouteModElement extends RouteElement{
    type: ModType
}


export interface ModRoM{
    routes:{[id:string]:RouteNodeElement};
}

export const defaultModRoM: ModRoM = {
    routes: {}
}
