namespace RideStylerShowcase.NumberHelper {
    /**
     * Returns the number bounded to a range
     * @param number The number to bound
     * @param min The minimum allowable number
     * @param max The maximum allowable number
     */
    export function bound(number:number, min:number, max:number):number {
        return number < min ? min : (number > max ? max : number);
    }

    /**
     * Extend a number range with a number
     * @param number The number to extend the range with
     * @param range The range to extend
     * 
     * @returns The range object that was passed in extended by the number
     */
    export function extendRange(number:number, range:Range):Range {
        if (!range) range = {
            min: Infinity,
            max: -Infinity
        };

        if (number < range.min) range.min = number;
        if (number > range.max) range.max = number;

        return range;
    }

    export interface Range {
        min: number;
        max: number;
    }
}