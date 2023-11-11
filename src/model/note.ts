export default interface Note {
    start: number; // position in the pattern in ¼th notes
    pitch: number; // pitch from 0 - 12*8
    length: number; // length in ¼th notes
}