//TODO: This won't work. I'll redo this later today =)
class RouteElement{
    private before:RouteElement|null;   //id of the element before
    private self:string;                //id of the element
    private type:string|null;           //thing that the sound should be routed into (gain, input, pan, ...)
                                        //also, it is the type of the elements after, so what this element
                                        //will do on the element after
    private after:RouteElement|null;    //id of the element after
    

    constructor(before:RouteElement|null, self:string, after:RouteElement|null, type:string|null){
        this.before = before;
        this.self = self;
        this.after = after;
        this.type = type;
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
    public setType(type:string):void {
        this.type = type;
    }
    public removeType():void{
        this.type = null;
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
    public getType():string|null{
        return this.type;
    }
}

//Modulation Routing Machine
export interface ModRoM{
    routes:RouteElement[];  //The base elements of the routes
    //elements:string[];      //all element ids
    //addElement(element:string):boolean;
    //removeElement(element:string):void;
    addRootNode(element:string):void;
    removeRootNode(element:string):void;
    insert(element1:string, element2:string, type:string):void;
}

export function createModRoM():ModRoM{
    let routes:RouteElement[] = [];
    /*let elements:string[] = [];
    
    function addElement(element:string){
        if(elements.filter(e=>e==element).length==0){
            elements.push(element);
            return true;
        }
        return false;
    }

    function removeElement(element:string){
        elements = elements.filter(e => e!=element);
    
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
    }*/

    function addRootNode(element:string){
        let root = new RouteElement(null, element, null, null);
        routes.push(root);
    }

    function removeRootNode(element:string){
        routes = routes.filter(e => e.getSelf()!=element);
    }

    function insert(element1:string, element2:string, type:string){
        //TODO: Fully Implement
        let e2 = routes.find(e => e.getSelf() == element2);
        if(!e2){
            e2 = new RouteElement(null, element2, null, null);
        }

        let e1 = routes.find(e => e.getSelf() == element1);
        if(!e1){
            e1 = new RouteElement(null, element1, e2, type);
            routes.push(e1);
        }
        e2.setBefore(e1);

        console.info("tried to insert "+element1+" into "+element2 +" on type: "+ type);
        debugRoutingTree();
    }

    function debugRoutingTree(){
        console.info("TREE:");
        for(let i=0;i<routes.length;i++){
            console.warn("Root: " + routes[i].getSelf());
            let after = routes[i].getAfter();
            let e = 0;
            while(after !== null){
                console.warn(e+"-> "+after.getSelf()+" -> on: "+after.getBefore());
                e= e+1;
                after = after.getAfter();
            }
            console.warn("<<--"+i+"-->>");
        }
    }

    return {
        routes: routes,
        //elements: elements,
        //addElement: addElement,
        //removeElement: removeElement,
        addRootNode: addRootNode,
        removeRootNode: removeRootNode,
        insert: insert
    }
}
