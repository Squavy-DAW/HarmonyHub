import Pattern, { defaultPattern } from "@models/pattern";
import Track, { defaultTrack } from "./track";
import { generateId } from "@network/crypto";

export default interface Project {
    name: string,
    description: string,
    editDate: Date,
    createDate: Date,
    zoom: number,
    position: number,
    snap: number,
    data: {
        patterns: { [id: string]: Pattern },
        tracks: { [id: string]: Track },
    },
}

export const zoomBase = 100;

export const defaultProject: Project = {
    name: 'New Project',
    description: '',
    editDate: new Date(),
    createDate: new Date(),
    zoom: -1,
    position: 0,
    snap: 2,
    data: {
        patterns: {
            [generateId()]: defaultPattern,
        },
        tracks: { 
            [generateId()]: { ...defaultTrack, index: 0 },
            [generateId()]: { ...defaultTrack, index: 1 },
            [generateId()]: { ...defaultTrack, index: 2 },
            [generateId()]: { ...defaultTrack, index: 3 },
        },
    }
}