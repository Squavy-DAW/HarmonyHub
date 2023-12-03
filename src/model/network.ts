import { CryptoSocket } from "@network/sockets";

export default interface Network {
    name: string;
    room?: string;
    socket?: CryptoSocket;
}