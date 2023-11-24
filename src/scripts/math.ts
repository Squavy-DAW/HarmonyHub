export function slipFloor(num: number, decimal: number) {
    return Math.floor(num / decimal) * decimal;
}