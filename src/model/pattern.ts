import Note from "./note";

export default interface Pattern {
    name: string,
    color: string,
    data: { [id: string]: Note },
}