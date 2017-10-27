namespace RideStylerShowcase.StringHelper {
    /**
     * Returns the first word of the specified string
     * @param string The string to get the first word of
     */
    export function getFirstWord(string:string):string {
        if (typeof string !== 'string') return undefined;
        return string.trim().substr(0, string.indexOf(' '));
    }
}