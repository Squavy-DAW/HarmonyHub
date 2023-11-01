import { TypedSocket as Socket } from "@network/packets";
import { io } from "socket.io-client";
import { decrypt, encrypt } from "./crypto";

export function createSocket(): Socket | undefined {
    try {
        return io(import.meta.env.VITE_WEBSOCKET);
    } catch (error) {
        return undefined;
    }
}

export async function createSession(socket: Socket): Promise<string | undefined> {
    return await new Promise<string>((resolve, reject) => {
        socket.timeout(5000).emit('hh:create-session', null, (error, ack) => {
            if (error) reject(error);
            resolve(ack.room);
        });
    });
}

export async function joinSession(socket: Socket, room: string): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
        socket.timeout(5000).emit('hh:join-session', {
            room: room
        }, (error, ack) => {
            if (error) reject(error);
            resolve(ack.success);
        });
    });
}

export async function broadcast(socket: Socket, key: CryptoKey, data: unknown) {
    return socket.emit('hh:broadcast', {
        data: await encrypt(key, data)
    });
}

export async function request<TRes>(socket: Socket, key: CryptoKey, data: unknown) : Promise<TRes> {
    return new Promise(async resolve => {
        socket.emit('hh:request', {
            data: await encrypt(key, data)
        }, ({ data }) => {
            resolve(data as TRes);
        });
    })
}

export async function handleBroadcast(socket: Socket, key: CryptoKey, callback: (data: unknown) => void) {
    socket.on('hh:broadcast', async ({ data }) => {
        callback(await decrypt(key, data));
    });
}

export async function handleRequest(socket: Socket, key: CryptoKey, callback: (data: unknown) => unknown) {
    socket.on('hh:request', async ({ data }, ack) => ack({
        data: await encrypt(key, await callback(await decrypt(key, data)))
    }));
}