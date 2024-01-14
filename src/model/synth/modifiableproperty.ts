import { ModType } from "./modRoM";

export default interface ModifiableProperty {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
    type: ModType,
    default: number,
    max: number,
    min: number,
    steps?: number[],
    stepping: boolean
}