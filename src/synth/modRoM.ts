export type ModType = "Pan" | "Gain" | "Unison" | "Phase" | "Detune" | "Waveform";

interface RouteElement{}

interface RouteNodeElement extends RouteElement{
    children: {[id: string]:RouteElement}
}

interface RouteModElement extends RouteElement{
    type: ModType
}


export interface ModRoM{
    routes:{[id:string]:RouteNodeElement};
    addRootNode(element:string):void;
    removeRootNode(element:string):void;
    insert(element1:string, element2:string, type?:ModType):void;
}

let routes:{[id:string]:RouteNodeElement} = {};
function addRootNode(id:string){
    routes[id] = {
        children:{}
    }
}

function removeRootNode(id:string){
    delete routes[id];
}

function insert(element1:string, element2:string, type?:ModType){
    //TODO: Fully Implement
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
}

export function createModRoM():ModRoM{
    return {
        routes: routes,
        addRootNode: addRootNode,
        removeRootNode: removeRootNode,
        insert: insert
    }
}
