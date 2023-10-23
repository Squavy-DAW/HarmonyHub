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
    let peer = new Peer(prefix+id, {
        debug: 2,
        logFunction: (logLevel, ...rest) => { console.log(logLevel, rest) }
    });
    peer.on('open', id => {
        console.log('ID: ' + id);
    });
    peer.on('connection', conn => {
        console.log(`new connection '${conn.peer}' '${conn.metadata.name}'`);
        
    })
    
    return peer;
}

export function joinSession(name: string, id: string) : Peer {
    let peer = new Peer({
        debug: 2,
        logFunction: (logLevel, ...rest) => { console.log(logLevel, rest) }
    });
    peer.on('open', id => {
        console.log('ID: ' + id);
    });

    let conn = peer.connect(prefix+id, {
        reliable: true,
        metadata: { name: name }
    });
    conn.on('open', () => {
        console.info(`new connection '${conn.peer}'`);
    })

    return peer;
}