import { ClientToClientEvents, TypedSocket as Socket } from "@network/packets";
import { io } from "socket.io-client";
import { decrypt, encrypt } from "./crypto";
import { useContext } from "react";
import NetworkContext from "@src/context/networkcontext";

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

type EventParameters<T extends keyof ClientToClientEvents> = Parameters<ClientToClientEvents[T]>[0];
type EventReturnType<T extends keyof ClientToClientEvents> = ReturnType<ClientToClientEvents[T]>;

export async function broadcast<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, data: EventParameters<T>) {
    socket.emit('hh:broadcast', {
        data: await encrypt(key, {
            type: type,
            data: data
        })
    });
}

export async function request<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, data: EventParameters<T>): Promise<EventReturnType<T>> {
    return new Promise(async resolve => {
        socket.emit('hh:request', {
            data: await encrypt(key, {
                type: type,
                data: data
            })
        }, async ({ data }) => {
            resolve(await decrypt<ReturnType<ClientToClientEvents[T]>>(key, data));
        });
    })
}

export function survey<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, data: EventParameters<T>): Promise<boolean> {
    return new Promise(async resolve => {
        socket.emit('hh:survey', {
            data: await encrypt(key, {
                type: type,
                data: data
            })
        }, async ({ data }) => {
            if (data === null) return resolve(false);
            const replies = await Promise.all(data.map(res => decrypt<boolean>(key, res)));
            resolve(replies.every(reply => reply));
        });
    })
}

type EventCallback<T extends keyof ClientToClientEvents> = (id: string, data: EventParameters<T>) => EventReturnType<T> | Promise<EventReturnType<T>>;

export async function handle<T extends keyof ClientToClientEvents>(socket: Socket, key: CryptoKey, type: T, callback: EventCallback<T>) {
    socket.on('hh:data', async ({ id, data }, ack) => {
        let decrypted = await decrypt<{ type: T, data: EventParameters<T> }>(key, data);
        if (decrypted.type === type) {
            const result = await callback(id, decrypted.data);
            if (result instanceof Promise) {
                ack({ data: await encrypt(key, await result) });
            } else {
                ack({ data: await encrypt(key, result) });
            }
        }
    });
}