const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 128 },
        true, // extractable
        ["encrypt", "decrypt"],
    );
}

export async function encrypt(key: CryptoKey, content: any): Promise<ArrayBuffer> {
    return await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        encoder.encode(JSON.stringify(content)),
    );
}

export async function decrypt<T>(key: CryptoKey, content: ArrayBuffer) {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        key,
        content,
    );
    return JSON.parse(decoder.decode(decrypted)) as T;
}

export async function extract(key: CryptoKey): Promise<string> {
    return (await window.crypto.subtle.exportKey("jwk", key)).k!;
}

export async function importKey(key: string): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
        "jwk",
        {
            k: key,
            alg: "A128GCM",
            ext: true,
            key_ops: ["encrypt", "decrypt"],
            kty: "oct",
        },
        { name: "AES-GCM", length: 128 },
        true,
        ["encrypt", "decrypt"],
    );
}

export function generateId(set: Set<string> = new Set()): string {
    let id: string;
    do {
        id = crypto.randomUUID();
    } while (set.has(id));
    return id;
}