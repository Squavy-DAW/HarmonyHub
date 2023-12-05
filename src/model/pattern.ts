import Note from "./note";
import Track from "./track";

export default interface Pattern {
    name: string,
    color: string,
    tact: number,
    zoom: number,
    position: number,
    snap: number,
    locked: boolean,
    notes: { [id: string]: Note },
}

export function calculatePatternLength(pattern: Pattern): number {
    return Object.keys(pattern.notes).length > 0 ? Math.max(...Object.keys(pattern.notes).map(id => pattern.notes[id].start+pattern.notes[id].length), 0) : 4;
}

export type DraggingPattern = Pattern & {
    id: string;
    left: number;
    top: number;
    rotate: number;
    dropped?: boolean;
    active?: boolean;
    over?: Track;
};

export const defaultPattern: Pattern = {
    name: 'New Pattern',
    color: '#000000',
    tact: 4,
    zoom: 2,
    position: 0,
    snap: 4,
    locked: false,
    notes: {},
}