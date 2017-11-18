namespace RideStylerShowcase {
    import Box = ResizeableResourceImage.Box;

    const defaultSize:Box = {
        width: 200,
        height: 200
    };

    const minimumSize:Box = {
        width: 50,
        height: 50
    };

    const maximumSize:Box = {
        width: 800,
        height: 800
    };

    const defaultPosition:ridestyler.Requests.ImageRenderRequest = {
        PositionY: ridestyler.Requests.ImagePosition.Near, // Top,
        PositionX: ridestyler.Requests.ImagePosition.Near  // Left
    }

    export class ResizeableResourceImage<
        Endpoint extends ridestyler.RideStylerAPIEndpoint,
        ImageRenderingInstructions extends ridestyler.RidestylerAPIActionRequestMapping[Endpoint]|ridestyler.Requests.ImageRenderRequest
             = ridestyler.RidestylerAPIActionRequestMapping[Endpoint]
    > {

        /**
         * The bounding container for the image
         */
        private readonly container:HTMLElement;

        /**
         * The image
         */
        public readonly image:HTMLImageElement;

        /**
         * The currently detected size of the container
         */
        private currentSize:Box;

        /**
         * The RideStyler API action to call to render the image
         */
        private readonly action:Endpoint;
        
        /**
         * A set of base instructions to render the vehicle with
         */
        private baseInstructions:ImageRenderingInstructions;

        /**
         * The current instructions/parameters to render the image with
         */
        private instructions:ImageRenderingInstructions;

        /**
         * If true the image is visible (or transitioning to be visible)
         */
        private visible:boolean;

        /**
         * If true, transitions should be used
         */
        private readonly useTransitions:boolean;

        /**
         * The class to attach to the element to show it with a transition
         */
        private readonly transitionInClass:string;

        /**
         * A callback to attach to the image load event
         */
        private readonly imageLoadCallback:ResizeableResourceImage.ImageLoadCallback;

        /**
         * A callback to attach to the image error event
         */
        private readonly imageErrorCallback:ResizeableResourceImage.ImageErrorCallback;

        /**
         * A callback to call when the image is displayed
         */
        private readonly imageDisplayCallback:ResizeableResourceImage.ImageEventCallback;

        /**
         * The padding of the container or padding calculator
         */
        private readonly padding: Box|ResizeableResourceImage.PaddingCalculator;

        private readonly events:[EventTarget,string,EventListener][];

        /**
         * @param container The container to render the image in
         * @param options
         */
        constructor(container:HTMLElement, options:{
            /**
             * The image endpoint
             */
            action: Endpoint,

            /**
             * Instructions for rendering the image
             */
            instructions?: ImageRenderingInstructions,

            /**
             * Base instructions for rendering the image
             */
            baseInstructions?: ImageRenderingInstructions,

            /**
             * If true, load the image when first created
             * @default false
             */
            loadInitially?: boolean;

            /**
             * If true, listen to the window resize event
             * @default true
             */
            listenToWindowResize?: boolean;

            /**
             * A function to call each time the image is loaded
             */
            onLoad?: ResizeableResourceImage.ImageLoadCallback;

            /**
             * A function to call when the image has an error loading
             */
            onError?: ResizeableResourceImage.ImageErrorCallback;

            /**
             * A function to call when the image is fully visible (after any transitions)
             */
            onDisplayed?: ResizeableResourceImage.ImageEventCallback;

            /**
             * The padding for the container to display the image in. If not specified
             * it will be calculated. If false padding will not be calculated.
             */
            padding?: false|ResizeableResourceImage.Box|ResizeableResourceImage.PaddingCalculator;

            /**
             * If specified use the following transition class to display the image.
             * If unspecified don't use transitions
             * @default undefined
             */
            transitionClass?: string;

            /**
             * The class to apply to the image to transition it "in"
             * @default "in"
             */
            transitionInClass?: string;

            /**
             * The default size at which to render the image if one cannot
             * be calculated from the container
             * @default {"width": 200, "height": 200}
             */
            defaultSize?: {
                width: number,
                height: number
            }
        }) {
            this.container = container;

            this.action = options.action;

            this.image = document.createElement('img');
            this.container.appendChild(this.image);

            this.events = [];

            if (options.transitionClass) {
                this.image.classList.add(options.transitionClass);
                this.useTransitions = true;
            }

            this.transitionInClass = options.transitionInClass;

            if (typeof options.padding === 'undefined') this.padding = StyleHelper.calculatePadding;
            else if (options.padding === false) this.padding = {width: 0, height: 0};
            else this.padding = options.padding;

            this.imageLoadCallback = options.onLoad;
            this.imageErrorCallback = options.onError;

            this.image.addEventListener('error', error => this.onImageError(error));
            this.image.addEventListener('load', event => this.onImageLoad(event));

            if (typeof options.baseInstructions === 'object') this.baseInstructions = options.baseInstructions

            if (this.instructions && options.loadInitially !== false)
                this.update(this.instructions);

            if (options.listenToWindowResize !== false) {
                let timeout:number;
                const waitMs = 500;
    
                const resizeCallback = () => {
                    clearTimeout(timeout);
    
                    timeout = setTimeout(() => {
                        this.update();
                    }, waitMs);
                };
    
                window.addEventListener('resize', resizeCallback, false);
                this.events.push([window, 'resize', resizeCallback]);
            }
        }

        /**
         * Call this function after the component will no longer be used
         * to remove any internally attached event handlers
         */
        public destroy() {
            for (const registeredEvent of this.events) {
                let [target, eventType, listener] = registeredEvent;

                target.removeEventListener(eventType, listener);
            }
        }

        private resizeCallback = () => {
            this.update();
        }

        /**
         * Attached to the image error event
         * @param errorEvent The error event
         */
        private onImageError(errorEvent:ErrorEvent) {
            if (typeof this.imageErrorCallback === 'function') 
                this.imageErrorCallback(this.image, errorEvent);
        }

        /**
         * Attached to the image load event
         * @param event The image load event
         */
        private onImageLoad(event:Event) {
            if (typeof this.imageLoadCallback === 'function') 
                this.imageLoadCallback(this.image, event);

            if (!this.visible) this.show();
        }

        /**
         * Show the image
         */
        private show() {
            if (this.visible) return;

            if (this.useTransitions) {
                VisibilityHelper.show(this.image, this.transitionInClass).done(() => {
                    if (typeof this.imageDisplayCallback === 'function') 
                        this.imageDisplayCallback(this.image);
                });
            }

            this.visible = true;
        }

        /**
         * Calculate the size of the image from the container
         */
        private calculateRenderSize():Box {
            // Grab the size of the container
            let {clientWidth, clientHeight} = this.container;

            // Return default size if the container was not able to be detected
            if (!clientHeight || !clientWidth) return defaultSize;

            // Grab the padding size
            let padding:ResizeableResourceImage.Box = typeof this.padding === 'function' ? 
                this.padding(this.container) :
                this.padding;

            // The detected size of the container minus padding
            let detectedSize:Box = {
                width: clientWidth - padding.width,
                height: clientHeight - padding.height
            };

            // Get the pixel ratio for retina screens
            let pixelRatio = window.devicePixelRatio || 1;

            // Adjust the detected size to account for pixel ratio
            detectedSize.width *= pixelRatio;
            detectedSize.height *= pixelRatio;

            return BoxHelper.floor(BoxHelper.bound(detectedSize, minimumSize, maximumSize));
        }

        private sizeIsDifferent(box: ResizeableResourceImage.Box):boolean {
            if (!this.currentSize) return true;

            let {
                width: thisWidth,
                height: thisHeight
            } = this.currentSize;

            let {
                width: boxWidth,
                height: boxHeight
            } = box;

            return thisWidth !== boxWidth || thisHeight !== boxHeight;
        }

        /**
         * Update or create the image
         * @param instructions New instructions to render the image with
         */
        public update(instructions?:ImageRenderingInstructions) {
            let needsUpdate:boolean = false;

            // Update instructions
            if (instructions && this.instructions !== instructions) {
                this.instructions = instructions;
                needsUpdate = true;
            }

            // Update size
            {
                let renderSize:Box = this.calculateRenderSize();

                if (this.sizeIsDifferent(renderSize)) {
                    this.currentSize = renderSize;
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                let {width, height} = this.currentSize;

                this.image.src = ridestyler.ajax.url(this.action, ObjectHelper.assign({
                    Width: width,
                    Height: height
                }, defaultPosition, this.baseInstructions, this.instructions));
            }
        }
    }

    export namespace ResizeableResourceImage {
        export interface Box {
            width: number;
            height: number;
        }

        export interface ImageEventCallback {
            (image:HTMLImageElement):void;
        }
        
        export interface ImageLoadCallback extends ImageEventCallback {
            (image:HTMLImageElement, event:Event):void;
        }
        
        export interface ImageErrorCallback extends ImageEventCallback {
            (image:HTMLImageElement, event:ErrorEvent):void;
        }

        export interface PaddingCalculator {
            (container:Element):Box;
        }
    }
}