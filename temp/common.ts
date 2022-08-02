export function isString(value: any) {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any) {
    return isFinite(value) && value != null;
}

export function isPlainObject(value: any) {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}
