import { Synth, defaultSynth } from "@models/synth"

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
    octave: number
}

export const defaultTrack: Omit<Track, 'index'> = {
    name: "New Track",
    patterns: {},
    instrument: { ...defaultSynth },
    octave: 4
}