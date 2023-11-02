import { Socket } from "socket.io-client";

export default interface Network {
    name: string;
    cryptoKey: CryptoKey | undefined;
    room: string | undefined;
    socket: Socket | undefined;
}