import { ClientToClientEvents, ClientToServerEvents, ServerToClientEvents } from "@network/packets";
import { Socket, io } from "socket.io-client";
import { decrypt, encrypt } from "./crypto";

type EventParameters<T extends keyof ClientToClientEvents> = Parameters<ClientToClientEvents[T]>[0];
type EventReturnType<T extends keyof ClientToClientEvents> = ReturnType<ClientToClientEvents[T]>;
type EventCallback<T extends keyof ClientToClientEvents> = (id: string, data: EventParameters<T>) => EventReturnType<T> | Promise<EventReturnType<T>> | undefined;
type EventAck<T extends keyof ClientToClientEvents> = (id: string, data: EventReturnType<T>) => void;

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export async function checkServerUp(): Promise<boolean> {
    return fetch(`${import.meta.env.VITE_WEBSERVER}/status`)
        .then(_ => true)
        .catch(_ => false);
}

export function createSocket(ns: string): TypedSocket {
    return io(`${import.meta.env.VITE_WEBSOCKET}/${ns}`);
}

export async function createSession(): Promise<string | undefined> {
    const preflight = createSocket("");
    return await new Promise<string>(resolve => preflight.on('connect', () => {
        resolve(preflight.emitWithAck('sqw:client-preflight').then(({ ns }) => ns));
    }));
}

export interface CryptoSocket extends TypedSocket {
    readonly key: CryptoKey;
    readonly events: Map<keyof ClientToClientEvents, EventCallback<keyof ClientToClientEvents>>;
    addEventListener<T extends keyof ClientToClientEvents>(event: T, callback: EventCallback<T>): void,
    removeEventListener<T extends keyof ClientToClientEvents>(event: T, callback: EventCallback<T>): void,
    broadcast<T extends keyof ClientToClientEvents>(type: T, data: EventParameters<T>, callback?: EventAck<T>): void,
    request<T extends keyof ClientToClientEvents>(type: T, data: EventParameters<T>): Promise<EventReturnType<T>>,
}

export function createCryptoSocket(socket: TypedSocket, cryptoKey: CryptoKey): CryptoSocket {
    const events = new Map<keyof ClientToClientEvents, EventCallback<keyof ClientToClientEvents>>();
    socket.on('sqw:data', async ({ id }, binary, ack) => {
        type T = keyof ClientToClientEvents;
        const decrypted = await decrypt<{ type: T, data: EventParameters<T> }>(cryptoKey, binary);
        const cb = events.get(decrypted.type);
        if (cb) {
            const result = await cb(id, decrypted.data);
            if (!result) return ack(new Uint8Array([10, 20, 30, 40]));
            ack(await encrypt(cryptoKey, result));
        }
    });

    return Object.assign(socket, {
        key: cryptoKey,
        events: events,
        addEventListener<T extends keyof ClientToClientEvents>(event: T, callback: EventCallback<T>) {
            this.events.set(event, callback);
        },

        removeEventListener<T extends keyof ClientToClientEvents>(event: T, callback: EventCallback<T>) {
            this.events.delete(event);
        },

        async broadcast<T extends keyof ClientToClientEvents>(type: T, data: EventParameters<T>, callback?: EventAck<T>) {
            socket.emit('sqw:broadcast', await encrypt(this.key, { type, data }), async ({ len, data }) => {
                // payload_type:   j1 j2 j3 j4 b1 b1 b1 b2 b2 b3 b4
                // payload_length: 3  2  1  1  ^^^^^^^^ ^^^^^ ^^ ^^
                let binary_i = len;
                data.forEach(async (payload) => {
                    if ('id' in payload) {
                        const binary = data.slice(binary_i, binary_i + payload.len) as ArrayBuffer[];
                        if (!binary.length) return;
                        const decrypted = await decrypt<ReturnType<ClientToClientEvents[T]>>(this.key, binary[0]); // TODO: decrypt all
                        console.log("decrypted", decrypted, JSON.stringify(decrypted));

                        callback?.(payload.id, decrypted);
                        binary_i += payload.len;
                    }
                });
            });
        },

        async request<T extends keyof ClientToClientEvents>(type: T, data: EventParameters<T>): Promise<EventReturnType<T>> {
            return new Promise(async resolve => {
                socket.emit('sqw:request', await encrypt(cryptoKey, { type, data }), async (data, binary) => {
                    if (!data) return;
                    const decrypted = await decrypt<ReturnType<ClientToClientEvents[T]>>(this.key, binary);
                    resolve(decrypted);
                });
            })
        }
    });
}