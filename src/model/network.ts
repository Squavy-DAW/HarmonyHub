import { TypedSocket as Socket } from "@network/packets";

export default interface Network {
    name: string;
    cryptoKey?: CryptoKey;
    room?: string;
    socket?: Socket;
}