namespace RideStylerShowcase {
    /**
     * A list of all of our acceptable string keys
     */
    export type StringKeys = 
        "vehicle-select-visualize-intro" |
        "vehicle-select-share-intro" |
        "select-your-vehicle" |
        "tires" |
        "wheels" |
        "suspension" |
        "paint";

    /**
     * Defines what a strings dictionary should look like
     */
    export type IStringsLanguageDictionary = {
        [stringKey in StringKeys]:string;
    }

    /**
     * A list of acceptable languages
     */
    export enum LanguageKeys {
        En
    }
    
    /**
     * An internal structure for holding language data
     */
    class LanguageRegister {
        languageDictionary: IStringsLanguageDictionary;

        /**
         * Create a register for a language
         * @param languageDictionary The strings for the language
         */
        constructor(languageDictionary:IStringsLanguageDictionary) {
            this.languageDictionary = languageDictionary;
        }

        /**
         * Get a key from the language dictionary
         * @param key The string key
         */
        getString(key:StringKeys):string {
            return this.languageDictionary[key];
        }
    }

    /**
     * The default language to use if one is not provided to getStrings
     */
    let defaultLanguage:LanguageRegister;

    /**
     * An internal list of all registered languages and their strings
     */
    let languageRegisters: {[languageKey:number]:LanguageRegister} = {}

    export namespace strings {
        /**
         * Register a language to be used in the showcase
         * @param languageKey The key of the language you are registering
         * @param languageDictionary The strings for the language
         */
        export function registerLanguage(languageKey:LanguageKeys, languageDictionary:IStringsLanguageDictionary) {
            let languageRegister = languageRegisters[languageKey] = new LanguageRegister(languageDictionary);

            if (!defaultLanguage) defaultLanguage = languageRegister;
        }

        /**
         * Set a language to be used by default, when no key is passed into getStrings
         * @param languageKey The language key to use by default
         * @returns true, if the language is registered and set as default; otherwise false
         */
        export function setDefaultLanguage(languageKey:LanguageKeys):boolean {
            if (languageKey in languageRegisters) {
                defaultLanguage = languageRegisters[languageKey];
                return true;
            }

            return false;
        }

        /**
         * Tells you whether or not a language is registered
         * @param languageKey The key for the language
         */
        export function languageIsRegistered(languageKey:LanguageKeys):boolean {
            return languageKey in languageRegisters;
        }

        /**
         * Get a string from the registered strings
         * @param key The string key to return a string for
         * @param languageKey The language you want to use
         */
        export function getString(key:StringKeys, languageKey?:LanguageKeys):string {
            let languageRegister = languageKey in languageRegisters ?
                languageRegisters[languageKey] :
                defaultLanguage;
            
            let string:string;

            // If we don't have a language, or could not get the string from the register 
            if (!languageRegister || !(string = languageRegister.getString(key)))
                return key;
            
            return string;
        }
    }
}