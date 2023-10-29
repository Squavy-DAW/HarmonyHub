import { Socket } from "socket.io-client";

interface ServerToClientEvents {
    
}

interface ClientToServerEvents {
    'hh:create-session': (args: { name: string }, callback: (ack: { token: string }) => void) => void;
    'hh:join-session': (args: { name: string, id: string }, callback: (ack: { success: boolean }) => void) => void;
}

export type TypedSockets = Socket<ServerToClientEvents, ClientToServerEvents>;