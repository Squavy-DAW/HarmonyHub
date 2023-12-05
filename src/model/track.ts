import { Synth, createSynth } from "@synth/synth"

export interface TimedPattern {
    patternId: string,
    start: number,
    length: number,
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