export default interface ModifiableProperty {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
    type: string,
    default: number,
    max: number,
    min: number,
    step: number
}