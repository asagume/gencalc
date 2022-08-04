export function isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any): boolean {
    return isFinite(value) && value != null;
}

export function isPlainObject(value: any): boolean {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}

/** 簡易なdeep copy。undefinedなどは消失します */
export function deepcopy(value: any): any {
    return JSON.parse(JSON.stringify(value));
}
