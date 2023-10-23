import Peer from "peerjs";

export default interface Session {
    name?: string;
    id?: string;
    peer?: Peer;
}