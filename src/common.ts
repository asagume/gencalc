import _ from 'lodash';

export function isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: any): boolean {
    return isFinite(value) && value != null;
}

export function isBoolean(value: any): boolean {
    return value === true || value === false;
}

export function isPlainObject(value: any): boolean {
    const myType = Object.prototype.toString.call(value);
    return myType === '[object Object]';
}

/** 簡易なdeep copy。undefinedなどは消失します */
export function deepcopy(value: any): any {
    const result = JSON.parse(JSON.stringify(value));
    return result;
}

export function overwriteObject(dst: any, src: any) {
    if (_.isPlainObject(src) && _.isPlainObject(dst)) {
        const srcKeys = Object.keys(src);
        for (const key of srcKeys) {
            dst[key] = src[key];
        }
        for (const key of Object.keys(dst)) {
            if (!srcKeys.includes(key)) delete dst[key];
        }
    }
    return dst;
}

// eslint-disable-next-line
export const basename = (path: string) => path!.split('/')!.pop()!.split('.')!.shift()!;
