namespace RideStylerShowcase.PromiseHelper {
    export function all<T>(promises: (T | RideStylerPromise<T>)[]): RideStylerPromise<T[]>;
    export function all<T1, T2, T3, T4>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>, T4 | RideStylerPromise<T4>]): RideStylerPromise<[T1, T2, T3, T4]>;
    export function all<T1, T2, T3>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>, T3 | RideStylerPromise<T3>]): RideStylerPromise<[T1, T2, T3]>;
    export function all<T1, T2>(promises: [T1 | RideStylerPromise<T1>, T2 | RideStylerPromise<T2>]): RideStylerPromise<[T1, T2]>;
    export function all(promises: (object | RideStylerPromise)[]): RideStylerPromise {
        const results = [];
        const merged = ArrayHelper.reduce(promises, function (accumulator, currentPromise) {
            return then(then(accumulator as RideStylerPromise, 
                () => currentPromise), 
                r => results.push(r));
        }, resolved(null));

        Promise.all

        return then(merged as RideStylerPromise, () => results);
    }

    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    export function then<T_In, E_In=T_In, T_Out=T_In, E_Out=E_In>(promise:RideStylerPromise<T_In, E_In>, onfulfilled?: ((value: T_In) => T_Out | RideStylerPromise<T_Out, E_Out>) | undefined | null, onrejected?: ((reason: E_In) => T_Out | PromiseLike<T_Out>) | undefined | null): RideStylerPromise<T_Out, E_Out> {
        const returnPromise = ridestyler.promise<any>();

        promise.done(function (result) {
            if (typeof onfulfilled === 'function') {
                try {
                    let onfulfilledResult = onfulfilled(result);

                    if (isPromise(onfulfilledResult)) {
                        // Resolve the promise when the returned promise is resolved
                        onfulfilledResult
                            .done(result => returnPromise.resolve(result))
                            .fail(result => returnPromise.reject(result));

                    } else {
                        // Resolve the promise with the returned value
                        returnPromise.resolve(onfulfilledResult);
                    }

                } catch(exception) {
                    returnPromise.reject(exception);
                }
            } else {
                returnPromise.resolve(result);
            }
        });

        promise.fail(function (result) {
            if (typeof onrejected === 'function') {
                try {
                    let onrejectedResult = onrejected(result);
                    
                    if (isPromise(onrejectedResult)) {
                        // Resolve the promise when the returned promise is resolved
                        onrejectedResult
                            .done(result => returnPromise.resolve(result))
                            .fail(result => returnPromise.reject(result));

                    } else {
                        // Resolve the promise with the returned value
                        returnPromise.resolve(onrejectedResult);
                    }
                } catch (exception) {
                    returnPromise.reject(exception);
                }
            } else {
                returnPromise.reject(result);
            }
        })

        return returnPromise;
    }

    /**
     * Returns a new resolved promise with an optional value
     * @param value Optionally, a value to resolve the promise with
     */
    export function resolved<T>(value?:T): RideStylerPromise<T, never> {
        const promise = ridestyler.promise<T, never>();
              promise.resolve(value);

        return promise;
    }

    /**
     * Tests an object for a RidestylerPromise-like interface, testing for
     * done, fail and always functions.
     * @param o The object to test
     */
    export function isPromise(o: any): o is RideStylerPromise {
        return typeof o === 'object' &&
               typeof o.done === 'function' && 
               typeof o.fail === 'function' &&
               typeof o.always === 'function';
    }
}