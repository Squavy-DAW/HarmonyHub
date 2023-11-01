import { TypedSockets as Socket } from "@network/packets";
import { io } from "socket.io-client";

export function createSocket(): Socket | undefined {
    try {
        return io(import.meta.env.VITE_WEBSOCKET);
    } catch (error) {
        return undefined;
    }
}

export async function getSessionId(): Promise<string | undefined> {
    return await fetch(import.meta.env.VITE_WEBSERVER + '/new').then(res => res.text());
}

export async function createSession(socket: Socket, name: string): Promise<string | undefined> {
    return await new Promise<string>((resolve, reject) => {
        socket.timeout(5000).emit('hh:create-session', {
            name: name
        }, (error, ack) => {
            if (error) reject(error);
            resolve(ack.token);
        });
    });
}

export async function joinSession(socket: Socket, name: string, id: string): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
        socket.timeout(5000).emit('hh:join-session', {
            name: name,
            id: id
        }, (error, ack) => {
            if (error) reject(error);
            resolve(ack.success);
        });
    });
}