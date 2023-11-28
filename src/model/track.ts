import { Synth } from "@synth/synth"
import Pattern from "./pattern"

type TimedPattern = Pattern & {
    id: string,
    start: number,
}

export default interface Track {
    name: string,
    patterns: TimedPattern[],
    instrument: Synth,
}

export const defaultTrack: Track = {
    name: "New Track",
    patterns: [],
    instrument: null!
}