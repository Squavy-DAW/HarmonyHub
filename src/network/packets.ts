import Pattern from "@models/pattern";
import Project from "@models/project";
import { Socket } from "socket.io-client";

export interface ServerToClientEvents {
    'hh:data': (args: { id: string, data: ArrayBuffer }, callback: (res: { data: ArrayBuffer }) => void) => void;
    'hh:user-disconnected': (args: { id: string }) => void;
}

export interface ClientToServerEvents {
    'hh:create-session': (args: null, callback: (ack: { room: string }) => void) => void;
    'hh:join-session': (args: { room: string }, callback: (ack: { success: boolean }) => void) => void;
    'hh:broadcast': (args: { data: ArrayBuffer }) => void;
    'hh:request': (args: { data: ArrayBuffer }, callback: (res: { data: ArrayBuffer }) => void) => void;
    'hh:survey': (args: { data: ArrayBuffer }, callback: (res: { data: ArrayBuffer[] }) => void) => void;
}

export interface ClientToClientEvents {
    'hh:request-project': (args: null) => Project;
    'hh:user-joined': (args: { name: string }) => void;
    'hh:mouse-position': (args: { x: number, y: number }) => void;
    'hh:pattern-created': (args: { pattern: Pattern }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;