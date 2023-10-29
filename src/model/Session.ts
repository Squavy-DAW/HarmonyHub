import { TypedSockets as Socket } from "./packets";

export interface SessionDTO {
    name?: string;
    id?: string;
    socket?: Socket;
}

export interface Session {
    name: string;
    id: string;
    socket: Socket;
}