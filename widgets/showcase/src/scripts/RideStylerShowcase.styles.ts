namespace RideStylerShowcase.styles {
    let widthBreakpoints:[string, number][] = [
        ['phone-portrait', 319],
        ['phone-landscape', 420],
        ['tablet', 768],
        ['desktop', 992],
        ['desktop-xl', 1200],
        ['tv', 1600]
    ];

    export class StyleManager {
        element:HTMLElement;

        constructor (element:HTMLElement) {
            this.element = element;

            this.initialized = ridestyler.promise();

            this.initializeBreakpoints();
            this.watchSize();
            this.initializeCSS();
            this.resolveOnDOMLoad();
            this.initializeStyleClasses();
        }

        public initialized:RideStylerPromise;

        private resolveOnDOMLoad() {
            if (document.readyState === 'complete') {
                // The DOM is already loaded
                this.initialized.resolve();

                return;
            }

            // Wait for the DOM to load
            window.addEventListener('load', () => this.initialized.resolve(), false);
        }

        /**
         * Load the CSS from {@link RideStylerShowcase.css} into the first HEAD element
         * found in the document of the container
         */
        private initializeCSS() {
            if (!StyleHelper.isOffsetPositioned(this.element))
                this.element.style.position = 'relative';

            if ('css' in RideStylerShowcase === false) return;

            let containerDocument = this.element.ownerDocument;
            let head = containerDocument.getElementsByTagName("head").item(0);

            // If we don't have a HEAD element, create one and add it to the DOM
            if (!head) {
                head = document.createElement('head');
                containerDocument.documentElement.insertBefore(head, containerDocument.firstChild);
            }

            let stylesheet = document.createElement('style');

            // Add our CSS to the stylesheet
            stylesheet.appendChild(document.createTextNode(RideStylerShowcase.css));

            // Add the CSS to the header before the first HEAD element
            head.insertBefore(stylesheet, HTMLHelper.firstChildWithTag(head, "STYLE"));

            // Remove the CSS from our object so it's not specified twice
            delete RideStylerShowcase.css;
        }

        private initializeStyleClasses() {
            if (StyleHelper.isTouchDevice)
                this.element.classList.add('is-touch');
        }

        private initializeBreakpoints() {
            // Make sure our breakpoints are sorted
            widthBreakpoints.sort(function (a,b) {
                return a[1] - b[1];
            });

            this.applyBreakpointClasses();

            switch (document.readyState) {
                case "loading":
                    HTMLHelper.getDocument(this.element).addEventListener("DOMContentLoaded", () => this.applyBreakpointClasses());
                case "interactive":
                    HTMLHelper.getWindow(this.element).addEventListener("load", () => this.applyBreakpointClasses());
            }
        }

        private resize() {
            this.applyBreakpointClasses();

            if (typeof this.onResize === 'function') this.onResize();
        }

        private resized() {
            if (typeof this.onResized === 'function') this.onResized();
        }

        /**
         * A callback each time the element is resized
         */
        public onResize: () => void;

        /**
         * A callback for after the user is done resizing the element
         */
        public onResized: () => void;

        private watchSize() {
            let element:HTMLElement = this.element;

            let timer:number;
            const resizedEventDelay = 200;

            let elementSize = {
                width: element.clientWidth,
                height: element.clientHeight
            };

            HTMLHelper.getWindow(element).addEventListener('resize', () => {
                let newElementSize = {
                    width: element.clientWidth,
                    height: element.clientHeight
                };

                if (newElementSize.width !== elementSize.width || newElementSize.height !== elementSize.height) {
                    // The element's size has changed
                    elementSize = newElementSize;

                    this.resize();

                    clearTimeout(timer);

                    timer = setTimeout(() => {
                        this.resized();
                    }, resizedEventDelay);
                }

            }, false);
        }

        /**
         * The currently applied breakpoint class
         */
        private currentBreakpoint:string;

        private applyBreakpointClasses() {
            let element:HTMLElement = this.element;

            let height = element.offsetHeight;
            let width = element.offsetWidth;

            // Don't run if we don't have a height or width yet
            if (!height || !width) return;

            let newBreakpoint:string;

            // The new breakpoint is the next lowest value in the array
            {
                let i:number;
                for (i = widthBreakpoints.length - 1; i >= 0; i--)
                    if (widthBreakpoints[i][1] <= width)
                        break;

                newBreakpoint = i >= 0 ? widthBreakpoints[i][0] : undefined;
            }

            // If the current breakpoint hasn't changed, don't run the rest of this logic
            if (newBreakpoint === this.currentBreakpoint) return;

            // Set our current breakpoint to the newly defined one
            this.currentBreakpoint = newBreakpoint;

            let className = element.className;

            // Remove any breakpoint classes from the element's class
            className = className.replace(/\bridestyler-showcase-breakpoint-.+?(?= |$)/gi, "").trim();

            // Add in the breakpoint class if we have one
            if (newBreakpoint)
                className += ' ridestyler-showcase-breakpoint-' + newBreakpoint;

            element.className = className;
        }
    }
}
