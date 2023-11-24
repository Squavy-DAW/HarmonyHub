export function slipFloor(num: number, decimal: number) {
    return Math.floor(num / decimal) * decimal;
}

export function slipCeil(num: number, decimal: number) {
    return Math.ceil(num / decimal) * decimal;
}