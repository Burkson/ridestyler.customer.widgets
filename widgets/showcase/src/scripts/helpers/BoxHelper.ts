namespace RideStylerShowcase.BoxHelper {
    /**
     * Bound a box to a minimum and/or maximum bounding box
     * @param box The box to bound
     * @param boundsMin The minimum bounding box
     * @param boundsMax The maximum bounding box
     */
    export function bound(box:Box, boundsMin?:Box|number, boundsMax?:Box|number):Box {
        if (typeof boundsMin === 'number') boundsMin = {
            width: boundsMin,
            height: boundsMin
        };

        if (typeof boundsMax === 'number') boundsMax = {
            width: boundsMax,
            height: boundsMax
        };

        // Get the scale change to scale box down to maximum bounds
        let scaleToMax:number = boundsMax ? Math.min(boundsMax.width/box.width, boundsMax.height/box.height) : 1;
        // Get the scale change to scale box up to minimum bounds
        let scaleToMin:number = boundsMin ? Math.max(boundsMin.width/box.width, boundsMin.height/box.height) : 1;

        let scalar:number;

        if (scaleToMax < 1) scalar = scaleToMax;
        else if (scaleToMin > 1) scalar = scaleToMin;
        else return box;

        return scale(box, scalar);
    }

    /**
     * Scale a box by a scalar
     * @param box The box
     * @param scalar The number to scale the box by
     */
    export function scale(box:Box, scalar:number|Box):Box {
        if (typeof scalar === 'number') scalar = {
            width: scalar,
            height: scalar
        };

        return {
            width: box.width * scalar.width,
            height: box.height * scalar.height
        };
    }

    /**
     * Returns the box, without decimals
     * @param box The box
     */
    export function floor(box:Box) {
        return {
            width: ~~box.width,
            height: ~~box.height
        }
    }

    export interface Box {
        width: number;
        height: number;
    }
}