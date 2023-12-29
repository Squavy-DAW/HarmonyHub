export type ModType = "Pan" | "Gain" | "Unison" | "Phase" | "Detune" | "Waveform";

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

/*function insert(element1:string, element2:string, type?:ModType){
    if(routes[element1]){   //first element was already routed
        if(type){
            routes[element1].children[element2+"|"+type] = {type:type} as RouteModElement;
        }
        else{
            routes[element1].children[element2] = {children: {}} as RouteNodeElement;
        }
    }
    else{   //first element wasn't routed yet
        if(type){
            routes[element1] = {children: {
                [element2+"|"+type]:{type:type} as RouteModElement
            }};
        }
        else{
            routes[element1] = {children: {
                [element2]:{children:{}} as RouteNodeElement
            }};
        }
    }

    console.warn("tried to insert "+element1+" into "+element2 + (type?(" on type: "+type):""));
}

function remove(element1:string, element2:string, type?:ModType){
    //TODO: Implement
}*/

export const defaultModRoM: ModRoM = {
    routes: {}
}
