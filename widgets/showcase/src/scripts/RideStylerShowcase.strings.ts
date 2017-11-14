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
        "paint" |
        "front" |
        "rear" |
        "vehicle-details" |
        "change-vehicle" |
        "wheel-details" |
        "tire-details" |
        'select-paint' |
        'select-wheels' |
        'select-tires' |
        'adjust-suspension' |
        'change-wheel-size' |
        'no-results' |
        'wheel-features-specs' |
        'share-my-vehicle' |
        'share-instructions' |
        'no-description-wheel' |
        'show-specs' |
        'call' | 
        'size' |
        'offset' |
        'bolt-pattern' |
        'centerbore' | 
        'price' |
        'item-number' |
        'brands' |
        'finishes' | 
        'sizes' | 
        'all' |
        'all-brands' |
        'all-finishes' | 
        'all-sizes' | 
        'filter-results' |
        'loading-ellipsis' |
        'show-count-format-wheels' |
        'show-count-format-tires' |
        'specifications' | 
        'speed-rating' | 
        'any-speed-ratings' | 
        'features' | 
        'any-features';

    let defaultLanguageFormatProvider:IStringsLanguageFormatProvider = {
        currency: (number, symbol) => {
            return symbol + (+number.toFixed(2)).toLocaleString();
        }
    };
    
    /**
     * Defines what a strings dictionary should look like
     */
    export type IStringsLanguageDictionary = {
        [stringKey in StringKeys]:string;
    }

    export interface IStringsLanguageFormatProvider {
        currency?: (amount:number, symbol:string) => string;
    }


    export interface IStringsLanguage extends IStringsLanguageDictionary {
        format?: IStringsLanguageFormatProvider;
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
        private readonly language: IStringsLanguage;
        public readonly format: IStringsLanguageFormatProvider;

        /**
         * Create a register for a language
         * @param language The language definition
         */
        constructor(language:IStringsLanguage) {
            this.language = language;
            this.format = language.format;
        }

        /**
         * Get a key from the language dictionary
         * @param key The string key
         */
        getString(key:StringKeys):string {
            return this.language[key];
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
         * @param language The language provider
         */
        export function registerLanguage(languageKey:LanguageKeys, language:IStringsLanguage, setAsDefault?: boolean) {
            // Set default format provider
            if (!language.format) language.format = defaultLanguageFormatProvider;
            else for (let key in defaultLanguageFormatProvider) {
                // If the defaultLanguageProvider has a format function that is missing on the language's format provider,
                // implement it in the language's format provider
                if (defaultLanguageFormatProvider.hasOwnProperty(key) && key in language.format === false) {
                    language.format[key] = defaultLanguageFormatProvider[key];
                }
            }

            let languageRegister = languageRegisters[languageKey] = new LanguageRegister(language);

            if (setAsDefault || !defaultLanguage) defaultLanguage = languageRegister;
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
         * Returns the specified language, or the default language if it could not be found
         * @param languageKey The key of the language to retrieve
         */
        function getLanguage(languageKey?:LanguageKeys):LanguageRegister {
            return languageKey in languageRegisters ?
                languageRegisters[languageKey] :
                defaultLanguage;
        }

        /**
         * Get a string from the registered strings
         * @param key The string key to return a string for
         * @param languageKey The language you want to use
         */
        export function getString(key:StringKeys, languageKey?:LanguageKeys):string {
            let languageRegister:LanguageRegister = getLanguage(languageKey);
            let string:string;
            
            // If we don't have a language, or could not get the string from the register 
            if (!(string = languageRegister.getString(key)))
            return key;
            
            return string;
        }
        
        export function format(languageKey?:LanguageKeys):IStringsLanguageFormatProvider {
            return getLanguage(languageKey).format;
        }
    }
}