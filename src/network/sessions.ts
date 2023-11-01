import { ClientToClientEvents, TypedSocket as Socket } from "@network/packets";
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

export async function request<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, data: Parameters<ClientToClientEvents[T]>['0']) : Promise<ReturnType<ClientToClientEvents[T]>> {
    return new Promise(async resolve => {
        socket.emit('hh:request', {
            data: await encrypt(key, {
                type: type,
                data: data
            })
        }, ({ data }) => {
            resolve(data);
        });
    })
}

export async function handleBroadcast<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, callback: (data: ClientToClientEvents[T]) => void) {
    socket.on('hh:broadcast', async ({ data }) => {
        let decrypted = await decrypt(key, data);
        if (decrypted.type === type) callback(decrypted.data);
    });
}

export async function handleRequest<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, callback: (data: ClientToClientEvents[T]) => ReturnType<ClientToClientEvents[T]>) {
    socket.on('hh:request', async ({ data }, ack) => {
        let decrypted = await decrypt(key, data);
        if (decrypted.type === type) {
            let response = await callback(decrypted.data);
            ack({ data: await encrypt(key, response) });
        }
    });
}