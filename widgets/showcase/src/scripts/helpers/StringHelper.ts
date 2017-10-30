namespace RideStylerShowcase.StringHelper {
    /**
     * Returns the first word of the specified string
     * @param string The string to get the first word of
     */
    export function getFirstWord(string:string):string {
        if (typeof string !== 'string') return undefined;
        return string.trim().substr(0, string.indexOf(' '));
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