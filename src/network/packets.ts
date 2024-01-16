import Note from "@models/note";
import Pattern from "@models/pattern";
import Project from "@models/project";

export interface ServerToClientEvents {
    'sqw:data': (args: { id: string }, binary: ArrayBuffer, callback: (res: ArrayBuffer) => void) => void;
    'sqw:user-disconnected': (args: { id: string }) => void;
}

export interface JsonResponse {
    id: string;
    len: number;
}

export type BinaryResponse = ArrayBuffer;

export interface ClientToServerEvents {
    'sqw:client-preflight': (args: null) => { ns: string };
    'sqw:broadcast': (args: ArrayBuffer, callback: (args: { len: number, data: (JsonResponse | BinaryResponse)[] }) => void) => void;
    'sqw:request': (args: ArrayBuffer, callback: (args: { id: string }, binary: ArrayBuffer) => void) => void;
}

export interface ClientToClientEvents {
    'sqw:request-project': (args: null) => Project;
    'sqw:user-joined': (args: { name: string }) => void;
    'sqw:note-update': (args: { patternId: string, id: string, note: Note}) => void; 
    'sqw:note-deleted': (args: { patternId: string, id: string}) => void;
    'sqw:pattern-created': (args: { id: string, pattern: Pattern }) => void;
    'sqw:mouse-position': (args: { context: string, x: number, y: number }) => void;
    'sqw:username-update': (args: { name: string }) => void;
    'sqw:request-username': (args: null) => string;
}