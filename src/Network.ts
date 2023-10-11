import { Peer } from 'peerjs';

const prefix = 'HarmonyHubPeer_'

export function createToken() : string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let string = '';
    for (let i = 0; i < 64; i++) {
        string += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return string;
}

export function createSession(name: string, id: string) : Peer {
    let peer = new Peer(prefix+id);
    peer.on('connection', (conn) => {
        console.info(`new connection '${conn.peer}'`);
        conn.on('data', (data) => {
            console.info(`data from '${conn.peer}': ${data}`);
        })
    })
    return peer;
}

export function joinSession(name: string, id: string) : Peer {
    let peer = new Peer();
    let conn = peer.connect(prefix+id)
    conn.on('open', () => {
        conn.send('hi!');
    });

    return peer;
}