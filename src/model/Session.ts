import Peer from "peerjs";

export interface SessionDTO {
    name?: string;
    id?: string;
    peer?: Peer;
}

export interface Session {
    name: string;
    id: string;
    peer: Peer;
}