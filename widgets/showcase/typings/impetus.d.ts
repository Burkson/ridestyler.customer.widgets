declare class Impetus {
    constructor (settings: Impetus.Settings);

    /**
     * Disable movement processing.
     */
    pause();

    /**
     * Re-enable movement processing.
     */
    resume();

    /**
     * Adjust the multiplier in flight.
     * @param multiplier The new multiplier
     */
    setMultiplier(multiplier: number);

    /**
     * Adjust the current x and y output values.
     * @param x The new x value
     * @param y The new y value
     */
    setValues(x:number, y:number);

    /**
     * Adjust the X bound
     * @param bounds The new X bounds
     */
    setBoundX(bounds:Impetus.Bounds);

    /**
     * Adjust the Y bound
     * @param bounds The new Y bounds
     */
    setBoundY(bounds:Impetus.Bounds);

    /**
     * This will remove the previous event listeners.
     */
    destroy():null;
}

declare namespace Impetus {
    export interface Settings {
        /**
         * Element reference or query string for the target on which to listen for movement.
         * @default document
         */
        source?: HTMLElement|string;

        /**
         * This function will be called with the updated x and y values.
         * @required
         */
        update: UpdateFunction;

        /**
         * The relationship between the input and output values.
         * @default 1
         */
        multiplier?: number;

        /**
         * Rate at which values slow down after you let go.
         * @default 0.92
         */
        friction?: number;

        /**
         * Array of initial x and y values.
         * @default [0,0]
         */
        initialValues?: [number, number];

        /**
         * Array of low and high values. x-values will remain within these bounds.
         */
        boundX?: Bounds;

        /**
         * Array of low and high values. y-values will remain within these bounds.
         */
        boundY?: Bounds;

        /**
         * Whether to stretch and rebound values when pulled outside the bounds.
         */
        bounce?: boolean;
    }

    export type Bounds = [number, number];

    export interface UpdateFunction {
        (x:number, y:number);
    }
}