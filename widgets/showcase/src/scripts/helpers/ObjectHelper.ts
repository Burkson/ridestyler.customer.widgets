namespace RideStylerShowcase {
    export namespace ObjectHelper {
        /**
         * Copy all enumerable own properties from one or more source objects to a target object
         * @param target The target object
         * @param assignObjects The source object(s)
         */
        export function assign<T1,T2>(target:T1, ...assignObjects:T2[]) : T1 & T2;
        export function assign<T>(target:T, ...assignObjects:T[]): T;
        export function assign(target:object, ...assignObjects:object[]):object;
        export function assign(target:object, ...assignObjects:object[]):object {
            if (target == null) throw new TypeError("Cannot convert undefined or null to object");

            let to:object = Object(target);

            for (let source of assignObjects) {
                if (source == null) continue;

                for (var key in source) 
                    if (Object.prototype.hasOwnProperty.call(source, key))
                        to[key] = source[key];
            }

            return to;
        }

        /**
         * Returns all of the keys for own properties on an object
         * @param target The object
         */
        export function getKeys(target:object):string[] {
            let keys:string[] = [];

            for (var key in target)
                if (target.hasOwnProperty(key))
                    keys.push(key);

            return keys;
        }

        /**
         * Returns all of the values for own properties on an object
         * @param target The object
         */
        export function getValues<T>(target:{
            [k:string]:T;
        }):T[] {
            let values:T[] = [];

            for (let key in target)
                if (target.hasOwnProperty(key))
                    values.push(target[key]);

            return values;
        }
    }
}