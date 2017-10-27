namespace RideStylerShowcase.ArrayHelper {
    export function copy<ArrayType extends Array<any>>(array:ArrayType):ArrayType {
        let copy = new Array(array.length) as ArrayType;

        for (var index = 0; index < array.length; index++)
            copy[index] = array[index];

        return copy;
    }

    export function remove<T>(array:T[], itemMatch:T): T[];
    export function remove<T>(array:T[], itemMatch:(T)=>boolean): T[];
    export function remove<T>(array:T[], itemMatch:T|((T)=>boolean)): T[] {
        let newArray:T[] = new Array(array.length);

        let newArrayIndex = -1;

        for (let arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
            let item:T = array[arrayIndex];

            if (typeof itemMatch === 'function' && itemMatch(item) || item === itemMatch) {
                // Skip items that match the itemMatch function or value
                continue;
            }

            newArray[++newArrayIndex] = item;
        }

        // Shorten array to exclude length from removed items
        newArray.length = newArrayIndex + 1;

        return newArray;
    }

    export function filter<T>(array:T[], itemMatch:T): T[];
    export function filter<T>(array:T[], itemMatch:(T)=>boolean): T[];
    export function filter<T>(array:T[], itemMatch:T|((T)=>boolean)): T[] {
        let matchFunction:(T)=>boolean;

        if (typeof itemMatch === 'function') matchFunction = item => !itemMatch(item);
        else matchFunction = item => item != itemMatch;

        return remove(array, matchFunction);
    }

    export function map<T, U>(array:T[], mapFunction: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
        if (typeof Array.prototype.map === 'function') return array.map(mapFunction, thisArg);

        let result:U[] = new Array(array.length);

        for (let i = 0; i < array.length; i++) {
            let element = array[i];
            
            if (typeof thisArg === 'undefined') result[i] = mapFunction(array[i], i, array);
            else result[i] = mapFunction.call(thisArg, array[i], i, array);
        }

        return result;
    }

    export function reduce<T>(array:T[], reducer: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
    export function reduce<T, U = T>(array:T[], reducer: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
    export function reduce<T>(array:T[], reducer: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T {
        if (typeof Array.prototype.reduce === 'function') return array.reduce(reducer, initialValue);

        let accumulator:T = initialValue;

        for (let i = 0; i < array.length; i++)
            accumulator = accumulator !== undefined ?
                reducer.call(undefined, accumulator, array[i], i, array) :
                array[i];

        return accumulator;
    }
}