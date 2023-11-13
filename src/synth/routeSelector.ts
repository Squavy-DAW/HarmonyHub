import { AdvancedAudioNode } from "./synth";

class RouteElement{
    private before:RouteElement|null;   //id of the element before
    private self:string;                //id of the element
    private after:RouteElement|null;     //id of the element after
    

    constructor(before:RouteElement|null, self:string, after:RouteElement|null){
        this.before = before;
        this.self = self;
        this.after = after;
    }
    public setAfter(after:RouteElement):void {
        this.after = after;
    }
    public removeAfter():void{
        this.after = null;
    }
    public setBefore(before:RouteElement):void {
        this.before = before;
    }
    public removeBefore():void{
        this.before = null;
    }

    public getBefore():RouteElement|null{
        return this.before;
    }
    public getSelf():string{
        return this.self;
    }
    public getAfter():RouteElement|null{
        return this.after;
    }
}

//Modulation Routing Machine
export interface ModRoM{
    routes:RouteElement[];  //The base elements of the routes
    elements:string[];      //all element ids
    addElement(element:string):boolean;
    removeElement(element:string):void;
    addRootNode(idx:number):void;
    removeRootNode(idx:number):void
}

export function createModRoM():ModRoM{
    let routes:RouteElement[] = [];
    let elements:string[] = [];
    
    function addElement(element:string){
        if(elements.filter(e=>e==element).length==0){
            elements.push(element);
            return true;
        }
        return false;
    }

    function removeElement(element:string){
        elements = elements.filter(e => e==element);
    
        routes.forEach(e => {
            if(e.getSelf()==element){
                e.getBefore()?.removeAfter();
                let after = e.getAfter();
                if(after!=null){
                    routes.push(after);
                    after.removeBefore();
                }
            }
        });
    }

    function addRootNode(idx:number){
        let root = new RouteElement(null, elements[idx], null);
        routes.push(root);
    }

    function removeRootNode(idx:number){
        routes = routes.filter(e => e.getSelf()!=elements[idx]);
    }

    return {
        routes: routes,
        elements: elements,
        addElement: addElement,
        removeElement: removeElement,
        addRootNode: addRootNode,
        removeRootNode: removeRootNode
    }
}
