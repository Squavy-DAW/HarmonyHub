import ConnectionPointProps from "./connectionpointprops"

export type AudioNodeType = "AudioEndNode" | "Oscillator" | "Envelope";

export default interface AudioNodeProps {
    id: AudioNodeType
    name: string,
    data: { 
        x: number,
        y: number,
        width: number,
        height: number,
        connectionpoints: ConnectionPointProps[]
    }
}