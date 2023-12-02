import { Synth, createSynth } from "@synth/synth"
import Pattern from "./pattern"

type TimedPattern = Pattern & {
    id: string,
    start: number,
}

export default interface Track {
    index: number,
    name: string,
    patterns: { [id: string]: TimedPattern },
    instrument: Synth,
}

export const defaultTrack: Omit<Track, 'index'> = {
    name: "New Track",
    patterns: {},
    instrument: createSynth()
}