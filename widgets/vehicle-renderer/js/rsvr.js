/* exported RideStylerViewport */
function RideStylerViewport(elem, options) {
    // Viewport elements
    /** @type {HTMLElement} */
    var rootContainer = null;
    /** @type {HTMLElement} */
    var container  = null;
    /** @type {HTMLElement} */
    var loader = null;
    var renderer = null;

    // Store viewport states
    var self = this;
    var active = true;
    var vehicleActive = false;
    var state = { };


    // Store layout states
    var lastClientWidth = 0;
    var lastClientHeight = 0;
    var refreshTimeout = 0;
    var responsiveInterval = 0;
    var usingPseudoHeight = 0;

    // Make sure our options object is initialized
    options = options || {};

    if (options.state) {
        state = options.state;
    }

    // Attempt to find our container based on the selection string if we can
    if (typeof elem === 'string') {
        if (typeof document.querySelector === 'function') {
            rootContainer = document.querySelector(elem);
        } else if (elem[0] === '.') {
            rootContainer = document.getElementsByClassName(elem.substring(1));
        } else if (elem[0] === '#') {
            rootContainer = document.getElementById(elem.substring(1));
        }
    } else if (typeof elem === 'object') {
        // Is this a DOM element
        if (elem.tagName) {
            rootContainer = elem;
        }
    }

    // Make sure we can find our element that we are trying to use for this viewer
    if (!rootContainer) console.error('Could not find element specified for: ' + elem);
    var rootStyles = 'getComputedStyle' in window ? getComputedStyle(rootContainer) : rootContainer.runtimeStyle;

    // Prepare the container so it can properly wrap the contents
    var isOffsetPositioned = function () {
        var position = rootContainer.style.position;
        var isOffsetPositionValue = function (value) {
            return value === 'fixed' || value === 'absolute' || value === 'relative';
        };

        if (isOffsetPositionValue(position)) return true;

        if (!rootStyles) return false;
        return isOffsetPositionValue(rootStyles.position);
    }();

    // If we're not positioned using offset positioning, set relative positioning on the container
    if (!isOffsetPositioned)
        rootContainer.style.position = 'relative';

    // Insert our image container element that will be used for holding our rendered images
    container = document.createElement('div');

    // Setup style of the element
    container.className = 'rsvr-viewport';
    container.style.position = 'absolute';
    container.style.left = rootStyles.paddingLeft;
    container.style.top = rootStyles.paddingTop;
    container.style.right = rootStyles.paddingRight;
    container.style.bottom = rootStyles.paddingBottom;
    rootContainer.appendChild(container);

    // Create our other required elements
    createLoaderElement();

    // We are always using the image renderer since that is all that is supported currently
    renderer = new RideStylerImageRenderer(container);

    var desiredAspectHeight = null;
    if (typeof options.containerAspectRatio === 'number') {
        desiredAspectHeight = options.containerAspectRatio;
    }

    this.ResizeRenderArea = function() {
        if (container.clientWidth != lastClientWidth || (desiredAspectHeight == null && usingPseudoHeight == false && container.clientHeight != lastClientHeight)) {
            lastClientWidth = container.clientWidth;          
            lastClientHeight = container.clientHeight;

            // Handle situations where the rootContainer does not provide a height because it is not specifically set
            if (lastClientHeight === 0 && (desiredAspectHeight === null || (rootContainer.clientHeight === 0 && rootContainer.clientWidth !== 0))) {
                usingPseudoHeight = true;
                container.style.position = 'relative';
                container.style.left = '0';
                container.style.top = '0';
            }

            // Calculate our pseudo height since width changed
            if (usingPseudoHeight) {
                container.style.height = lastClientWidth * 0.5 + 'px';
            }

            // Make sure our renderer is active before attempt to redraw
            if (vehicleActive) {
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(function() {
                    // Trigger a refresh on the renderer if we have an active vehicle
                    if (vehicleActive !== true) return;
                    self.Update(true);
                }, 150);
            }
        }
    };  

    this.SuspendLayout = function() {
        if (active === false) return;
        if (options.responsive !== false) 
            clearInterval(responsiveInterval);
    };

    this.ResumeLayout = function() {
        if (active === false) return;
        if (options.responsive !== false)
            responsiveInterval = setInterval(this.ResizeRenderArea, 100);

        // Trigger our resize regardless because we may want an espect ratio but not a reponsive monitor.
        setTimeout(this.ResizeRenderArea, 10);
    };   

    this.Destroy = function() {
        if (active === false) return;
        active = false;

        this.SuspendLayout();

        // Remove our viewport element from the original target
        rootContainer.removeChild(container);

        // Cleanup references to detached elements
        container = null;
        loader = null;
        renderer = null;
    };

    this.CurrentInstructions = function (newInstructions) {
        if (typeof newInstructions !== 'undefined') {
            return this.Update(newInstructions);
        }

        return state;
    };

    this.Update = function(instructions) {
        if (active === false) return;

        var forcedUpdate = (instructions === true);
        var skipRendering = false;

        // Let our system know that we are ready to rock
        vehicleActive = true;

        var pixelRatio = getPixelRatio();
        var dimensions = {
            width: Math.round(container.clientWidth * pixelRatio),
            height: Math.round(container.clientHeight * pixelRatio)
        };

        // If we are maintaining the aspect ratio we need to update that
        if (desiredAspectHeight != null) {
            dimensions.height = Math.round(dimensions.width * desiredAspectHeight);
        }

        if (forcedUpdate === false) 
        {
            // Make sure our instructions are in an object format
            instructions = prepareArguments(instructions);

            // Make sure we are using the correct size for our viewport
            instructions.width = dimensions.width;
            instructions.height = dimensions.height;

            // Update our internal state and watch for changes
            var hasChanges = false;
            for(var x in instructions) {
                var v1 = state[x];
                var v2 = instructions[x];
                if (v1 != v2) {
                    state[x] = v2;
                    hasChanges = true;
                }
            }
            // If we didn't make any changes to our internal state we don't need to perform an update
            if (hasChanges === false) {
                skipRendering = true;
            }
        }
        else
        {
            // This is a force update so just make sure we have the newest dimensions for our image
            state.width = dimensions.width;
            state.height = dimensions.height;
        }

        if (state.width == 0 || state.height == 0) {
            console.log('Skipping vehicle render since current dimension would be 0.');
            skipRendering = true;
        }

        if (skipRendering)
        {
            var promise = ridestyler.promise();
            promise.resolve();
            return promise;
        }

        return renderer.Render(state);
    };

    this.Reset = function() {
        if (active === false) return;

        state = {};
        if (typeof renderer.Reset === 'function') renderer.Reset();
    };

    // Begin our layout logic for this component since it is now created
    this.ResumeLayout();

    function prepareArguments(args) {
        var values = {};

        if (args) {
            if (typeof args === 'string') {
                var tokens = args.split('?');
                tokens = (tokens.length == 1 ? tokens[0] : tokens[1]).split('&');
                for(var i = 0; i < tokens.length; i++) {
                    var kv = tokens[i].split('=');
                    var key = decodeURIComponent(kv[0]).toLowerCase();
                
                    // Skip over variables that are not used for rendering
                    if (key == 'key' || key == 'token') continue;

                    values[key] = decodeURIComponent(kv[1]);
                }
            } else {
                // Make sure all keys are in lower case
                for(var k in args) {
                    values[k.toLowerCase()] = args[k];
                }
            }
        }

        return values;
    }

    function getPixelRatio() {
        if (window.devicePixelRatio) return window.devicePixelRatio;
        else return 1;
    } 

    function RideStylerImageRenderer(container) {
        var activeImage = null;
        var retiredImages = [];

        var layerRedrawTimer = 0;
        var activeLayerPromise = null;

        /**
         * @return {RideStylerPromise}
         */
        this.Render = function(instructions) {
            return createNewLayer(instructions);
        };

        this.Reset = function () {
            if (activeImage != null) {
                container.removeChild(activeImage);
                activeImage = null;
            }
        };

        /**
         * @return {RideStylerPromise}
         */
        function createNewLayer(instructions) {
            // Clear our pending refresh
            if (activeLayerPromise != null && !activeLayerPromise.isResolved() && !activeLayerPromise.isRejected()) {
                clearTimeout(layerRedrawTimer);
                activeLayerPromise.reject({ cancelled: true });
            }

            var promise = activeLayerPromise = ridestyler.promise();

            // Queue our redraw
            layerRedrawTimer = setTimeout(function() {
                // Show our loader since we are creating a new layer
                showLoaderElement();

                // Retire our active image if it is available
                if (activeImage != null) {
                    // hideOldVehicle();
                    retiredImages.push(activeImage);
                    activeImage = null;
                }

                // Find all of our old images and fade them to half transparent (if they are visible)
                for(var i = retiredImages.length - 1; i >= 0; i--) {
                    var oimg = retiredImages[i];

                    // Partially fade out our retired images
                    if (oimg.style.opacity > 0.5) oimg.style.opacity = 0.5;
                }
                
                var imageUrl = ridestyler.ajax.url('Vehicle/Render', instructions);


                // Create a new image element for the current render result
                var img = document.createElement('img');
                img.className = 'rsvr-vehicle';
                img.style.position = 'absolute';
                img.style.maxWidth = '100%';
                img.style.left = 0;
                img.style.top = 0;
                img.style.opacity = 0;
                img.style.transition = 'opacity linear 300ms';
                img.alt = '';

                // Add our new image layer to the DOM
                container.appendChild(activeImage = img);

                // Listen for our new layer to become ready and display it to the user. Also, cleanup any legacy layers.
                img.onload = function() {
                    // Only fade in this IMG if it hasn't already been replaced.
                    if (img == activeImage) {
                        hideLoaderElement();
                        img.style.opacity = 1;

                        var removedImages = retiredImages.splice(0, retiredImages.length);
                        // Fade all of our old images out of view
                        for(var i = 0; i < removedImages.length; i++) {
                            removedImages[i].style.opacity = 0;
                        }

                        // Remove the elements after they have had a chance to fade out
                        setTimeout(function() {
                            for(var i = 0; i < removedImages.length; i++) {
                                container.removeChild(removedImages[i]);
                            }
                            promise.resolve();
                        }, 300);
                    }
                };

                img.onerror = function () {
                    promise.reject();
                };

                // Start loading our image
                img.src = imageUrl;
            }, 100);

            return promise;
        }
    }

    function createLoaderElement() {
        loader = document.createElement('img');

        // Set our image
        loader.src = '//static.ridestyler.net/images/loaders/loader_radial_chaser_back_on_white_32.gif';
        loader.alt = '';

        // Setup style of the element
        loader.className = 'rsvr-loader';
        loader.style.padding = '5px';
        loader.style.borderRadius = '21px';
        loader.style.background = '#fff';
        loader.style.opacity = 0;
        loader.style.transition = 'opacity linear 300ms';

        // Position in our container
        loader.style.position = 'absolute';
        loader.style.left = '50%';
        loader.style.top = '50%';
        loader.style.zIndex = '50';

        // Offset for size
        loader.style.marginLeft = '-21px';
        loader.style.marginTop = '-21px';

        container.appendChild(loader);
        showLoaderElement();
    }

    function showLoaderElement() {
        loader.style.opacity = 0.75;
    }

    function hideLoaderElement() {
        loader.style.opacity = 0;
    }
}