import { Synth } from "@synth/synth"
import Pattern from "./pattern"

type TimedPattern = Pattern & {
    start: number,
}

export default interface Track {
    patterns: TimedPattern[]
    instrument: Synth
}

export const defaultTrack: Track = {
    patterns: [],
    instrument: null!
}