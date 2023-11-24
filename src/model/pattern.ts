import Note from "./note";

export default interface Pattern {
    name: string,
    color: string,
    tact?: number,
    zoom?: number,
    position?: number,
    snap?: number,
    locked: boolean,
    notes: { [id: string]: Note },
}

export type DraggingPattern = Pattern & {
    id: string;
    left: number;
    top: number;
    rotate: number;
    dropped?: boolean;
    active?: boolean;
    over?: string;
};

export const defaultPattern: Pattern = {
    name: 'New Pattern',
    color: '#000000',
    tact: 4,
    zoom: 1,
    position: 0,
    snap: 1,
    locked: false,
    notes: {},
}