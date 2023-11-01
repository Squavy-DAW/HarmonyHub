import { Socket } from "socket.io-client";

export interface ServerToClientEvents {
    'hh:user-joined': (args: { name: string }) => void;
    'hh:broadcast': (args: { data: ArrayBuffer }) => void;
    'hh:request': (args: { data: ArrayBuffer }, callback: (res: { data: any }) => void) => void;
}

export interface ClientToServerEvents {
    'hh:create-session': (args: null, callback: (ack: { room: string }) => void) => void;
    'hh:join-session': (args: { room: string }, callback: (ack: { success: boolean }) => void) => void;
    'hh:broadcast': (args: { data: ArrayBuffer }) => void;
    'hh:request': (args: { data: ArrayBuffer }, callback: (res: { data: any }) => void) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;