namespace RideStylerShowcase.StringHelper {
    /**
     * Returns the first word of the specified string
     * @param string The string to get the first word of
     */
    export function getFirstWord(string:string):string {
        if (typeof string !== 'string') return undefined;
        return string.trim().substr(0, string.indexOf(' '));
    }

    /**
     * Returns true if the sequence of elements of searchString converted to a String is the
     * same as the corresponding elements of this object (converted to a String) starting at
     * endPosition – length(this). Otherwise returns false.
     */
    export function endsWith(string:string, ending:string, index?:number) {
        if (!(index < this.length)) index = this.length;
        else index |= 0;
        
        let endingLength = ending.length;
        return string.substr(index - endingLength, endingLength) === ending;
    }

    export function escapeRegExp(string:string):string {
        /**
         * Used to match `RegExp`
         * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
         */
        const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
        const reHasRegExpChar = RegExp(reRegExpChar.source);

        return (string && reHasRegExpChar.test(string))
            ? string.replace(reRegExpChar, '\\$&')
            : string;
    }
}