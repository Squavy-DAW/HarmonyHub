export type ConnectionType = "in" | "out" | "mod"

export default interface ConnectionPoint {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
    type: string,
    id: ConnectionType
}