import { TypedSocket as Socket } from "@network/packets";

export default interface Network {
    name: string;
    cryptoKey: CryptoKey | undefined;
    room: string | undefined;
    socket: Socket | undefined;
}