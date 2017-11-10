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
}