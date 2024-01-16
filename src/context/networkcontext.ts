import { CryptoSocket } from "@network/sockets";
import React from "react";

interface NetworkContextProps {
    room?: string;
    setRoom: React.Dispatch<React.SetStateAction<string | undefined>>;
    socket?: CryptoSocket;
    setSocket: React.Dispatch<React.SetStateAction<CryptoSocket | undefined>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    readonly serverUp: boolean;
}

const NetworkContext = React.createContext<NetworkContextProps>(undefined!);
export default NetworkContext;