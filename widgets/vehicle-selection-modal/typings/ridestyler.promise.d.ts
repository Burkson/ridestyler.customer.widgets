declare namespace ridestyler {
    export function promise():RideStylerPromise;
}

class RideStylerPromise {
    /**
     * Get the current state of this promise
     */
    state():RideStylerPromiseState;

    /**
     * Get the value set in the resolve or reject call
     */
    value():any;

    /**
     * Change the state to a specified state
     * @param state The state to change to
     * @param value The value to set
     * @returns The new state of the promise
     */
    changeState(state:RideStylerPromiseState, value:any):RideStylerPromiseState;

    /**
     * Resolve this promise
     * @param value The value to set
     */
    resolve(value?:any);

    /**
     * Reject this promise
     * @param value The value to set
     */
    reject(value?:any);

    /**
     * Attach a callback to run when resolved or rejected
     * @param callback A callback to run when resolved or rejected
     * @returns This promise
     */
    always(callback:IRideStylerPromiseCallback): RideStylerPromise;
    
    /**
     * Attach a callback to run when resolved
     * @param callback A callback to run when resolved
     * @returns This promise
     */
    done(callback:IRideStylerPromiseCallback): RideStylerPromise;
    
    /**
     * Attach a callback to run when rejected
     * @param callback A callback to run when rejected
     * @returns This promise
     */
    fail(callback:IRideStylerPromiseCallback): RideStylerPromise;

    /**
     * Returns true if this promise's state is Resolved
     */
    isResolved(): boolean;

    /**
     * Returns true if this promise's state is Rejected
     */
    isRejected(): boolean;
}

enum RideStylerPromiseState {
    Pending = 0,
    Resolved = 1,
    Rejected = 2
}
interface IRideStylerPromiseCallback {
    ( value: any ) : void;
}