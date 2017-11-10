namespace RideStylerShowcase.StyleHelper {
    /**
     * If true, the window.getComputedStyle is available
     */
    let hasGetComputedStyle = 'getComputedStyle' in window;

    /**
     * If true, HTMLElement.currentStyle is available
     */
    let hasCurrentStyleSupport = false;

    // Test for support on element properties
    (function () {
        let testElement = document.createElement('div');

        hasCurrentStyleSupport = 'currentStyle' in testElement;

        transitionEndEvent = (function () {
            // Transition event mapping
            var transitions = {
                'transition'       : 'transitionend',
                'WebkitTransition' : 'webkitTransitionEnd',
                'MozTransition'    : 'transitionend',
                'OTransition'      : 'oTransitionEnd'
            };

            for (var k in transitions)
                if (k in testElement.style)
                    return transitions[k];

            return undefined;
        })();

        transitionsSupported = !!transitionEndEvent;
    })();

    /**
     * The name of the transition end event for this browser
     */
    export let transitionEndEvent:string;

    /**
     * If false, transitions are not supported by the browser
     */
    export let transitionsSupported:boolean;

    /**
     * If false, this is not a touch device
     */
    export let isTouchDevice:boolean = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /**
     * If false, SVGs are not supported by the browser
     */
    export let svgSupported:boolean = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

    /**
     * Get the current computed style of an element
     * @param element The element
     */
    export function getComputedStyle(element:HTMLElement):CSSStyleDeclaration {
        if (hasGetComputedStyle) return window.getComputedStyle(element);
        if (hasCurrentStyleSupport && element['currentStyle'] !== null) return element['currentStyle'];

        throw "Unable to get computed style";
    }

    let offsetPositionings = ['absolute', 'relative', 'fixed'];
    /**
     * Detects whether or not absolute/relative/fixed positioning is enabled on an element
     * @param element The element
     */
    export function isOffsetPositioned(element:HTMLElement):boolean {
        var position = element.style.position;

        if (!position)
            position = getComputedStyle(element).position;

        // If we still don't have a position at this point it's not offset positioned
        if (!position) return false;

        // The element is offset positioned if its one of the above list
        position = position.toLowerCase();
        for (let positioning of offsetPositionings)
            if (position === positioning) return true;

        return false;
    }

    export function flattenClassList(...classes:(string|string[])[]):string[] {
        return ArrayHelper.reduce<string|string[], string[]>(classes, (classList, className) => {
            let subclassList:string[];

            if (typeof className === 'string') subclassList = [className];
            else subclassList = className;

            for (let c of subclassList) {
                classList = classList.concat(c.split(/\s+/));
            }

            return classList;
         }, []);
    }

    /**
     * Causes the browser to recalculate the styles of the specified element
     * @param element The element
     */
    export function triggerReflow(element:HTMLElement) {
        element.offsetHeight;
    }

    /**
     * Skip a transition on an element preformed by a callback function
     * @param element The element
     * @param callback A function to run causing a transition to be fired on the element
     */
    export function skipTransition(element:HTMLElement, callback:Function):void {
        if (!transitionsSupported) return callback();

        let oldTransition = element.style.transition;

        element.style.transition = 'none';
        callback.call(this);
        triggerReflow(element);

        element.style.transition = oldTransition;
    }

    export function onNextTransitionEnd(element:HTMLElement, listener:EventListenerOrEventListenerObject) {
        return HTMLHelper.once(element, transitionEndEvent, listener);
    }

    /**
     * Check if an element has all of the supplied classes
     * @param element The element
     * @param classes The classes to check
     */
    export function hasClasses(element:HTMLElement, classes: string[]):boolean;
    /**
     * Check if an element has all of the supplied classes
     * @param element The element
     * @param classes The classes to check
     */
    export function hasClasses(element:HTMLElement, ...classes: string[]):boolean;
    export function hasClasses(element:HTMLElement, classArray: string[]|string, ...classList:string[]):boolean {
        let classes: string[];

        if (typeof classArray === 'string') {
            classes = classList || [];
            classes.push(classArray);
        } else classes = classArray;

        for (let className of classes) {
            if (!element.classList.contains(className))
                return false;
        }

        return true;
    }

    export function parsePixels(pixels:string):number {
        if (!StringHelper.endsWith(pixels, 'px')) return undefined;

        return parseInt(pixels);
    }

    export function calculatePadding(element:HTMLElement) {
        let {
            paddingBottom,
            paddingTop,
            paddingLeft,
            paddingRight
        } = getComputedStyle(element);

        let width = parsePixels(paddingLeft) + parsePixels(paddingRight);
        let height = parsePixels(paddingTop) + parsePixels(paddingBottom);

        if (isNaN(width)) width = 0;
        if (isNaN(height)) height = 0;

        return {
            width: width,
            height: height
        };
    }
}
