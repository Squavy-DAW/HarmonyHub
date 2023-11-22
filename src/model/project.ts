import Pattern from "@models/pattern";
import Track, { defaultTrack } from "./track";
import { generateId } from "@network/crypto";

export default interface Project {
    name: string,
    description: string,
    editDate: Date,
    createDate: Date,
    data: {
        patterns: { [id: string]: Pattern },
        tracks: { [id: string]: Track },
    },
}

export const defaultProject: Project = {
    name: 'New Project',
    description: '',
    editDate: new Date(),
    createDate: new Date(),
    data: {
        patterns: {},
        tracks: { 
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
            [generateId()]: defaultTrack,
        },
    }
}