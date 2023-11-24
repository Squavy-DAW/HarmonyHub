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
    zoom: 1,
    position: 0,
    snap: 16,
    data: {
        patterns: {
            [generateId()]: defaultPattern,
        },
        tracks: { 
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
        },
    }
}