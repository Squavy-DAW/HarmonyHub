import Note from "./note";

export default interface Pattern {
    name: string,
    color: string,
    tact?: number,
    zoom?: number,
    position?: number,
    snap?: number,
    data: { 
        [id: string]: Note
    },
}