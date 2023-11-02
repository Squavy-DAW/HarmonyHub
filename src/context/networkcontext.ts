import { TypedSocket as Socket } from "@network/packets";
import React from "react";

interface NetworkContextProps {
    cryptoKey?: CryptoKey;
    setCryptoKey: (cryptoKey?: CryptoKey) => void;
    room?: string;
    setRoom: (room?: string) => void;
    socket?: Socket;
    setSocket: (socket?: Socket) => void;
}

const NetworkContext = React.createContext<NetworkContextProps>(undefined!);
export default NetworkContext;