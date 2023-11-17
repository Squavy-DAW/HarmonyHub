import Note from "./note";

export default interface Pattern {
    color: string,
    tact?: number,
    zoom?: number,
    position?: number,
    snap?: number,
    locked: boolean,
    data: { 
        [id: string]: Note
    },
}