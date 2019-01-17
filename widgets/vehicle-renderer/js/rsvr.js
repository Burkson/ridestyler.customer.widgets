/* exported RideStylerViewport */
function RideStylerViewport(elem, options) {
    // Viewport elements
    /** @type {HTMLElement} */
    var container  = null;
    var loader = null;
    var renderer = null;

    // Stores the current vehicle state for the vehicle
    var active = false;
    var state = { };

    // Make sure our options object is initialized
    options = options || {};

    if (options.state) {
        state = options.state;
    }

    // Attempt to find our container based on the selection string if we can
    if (typeof elem === 'string') {
        if (typeof document.querySelector === 'function') {
            container = document.querySelector(elem);
        } else if (elem[0] === '.') {
            container = document.getElementsByClassName(elem.substring(1));
        } else if (elem[0] === '#') {
            container = document.getElementById(elem.substring(1));
        }
    } else if (typeof elem === 'object') {
        // Is this a DOM element
        if (elem.tagName) {
            container = elem;
        }
    }

    // Make sure we can find our element that we are trying to use for this viewer
    if (!container) console.error('Could not find element specified for: ' + elem);

    // Prepare the container so it can properly wrap the contents
    var isOffsetPositioned = function () {
        var position = container.style.position;
        var isOffsetPositionValue = function (value) {
            return value === 'fixed' || value === 'absolute' || value === 'relative';
        };

        if (isOffsetPositionValue(position)) return true;

        /** @type {CSSStyleDeclaration} */
        var calculatedStyle = 'getComputedStyle' in window ? getComputedStyle(container) : container.runtimeStyle;

        if (!calculatedStyle) return false;

        return isOffsetPositionValue(calculatedStyle.position);
    }();

    // If we're not positioned using offset positioning, set relative positioning on the container
    if (!isOffsetPositioned)
        container.style.position = 'relative';

    // Create our other required elements
    createLoaderElement();

    // Figure out which version of our viewer we want to use
    /*
    if (isCanvasSupported() == false) { // TODO: NEED TO REMOVE THE FALSE REQUIREMENT - WE ARE FLIPPING FOR DEBUG

    } else {
        renderer = new RideStylerImageRenderer(container);
    }
    */

    // We are always using the image renderer since that is all that is supported currently
    renderer = new RideStylerImageRenderer(container);

    var desiredAspectHeight = null;
    if (typeof options.containerAspectRatio === 'number') {
        desiredAspectHeight = options.containerAspectRatio;
    }

    var lastClientWidth = 0;
    var lastClientHeight = 0;
    var refreshTimeout = 0;
    this.ResizeRenderArea = function() {
        if (container.clientWidth != lastClientWidth || (desiredAspectHeight == null && container.clientHeight != lastClientHeight)) {
            lastClientWidth = container.clientWidth;
            state['width'] = lastClientWidth;

            // If we are maintaining the aspect ratio we need to update that
            if (desiredAspectHeight != null) {
                var height = Math.round(lastClientWidth * desiredAspectHeight);
                container.style.height = height + 'px';
                state['height'] = height;
            } else {
                lastClientHeight = container.clientHeight;
                state['height'] = lastClientHeight;
            }

            // Make sure our renderer is active before attempt to redraw
            if (active) {
                clearTimeout(refreshTimeout);
                refreshTimeout = setTimeout(function() {
                    // Trigger a refresh on the renderer
                    renderer.Render(state);
                }, 150);
            }
        }
    };

    // Check to see if we should be controlling the container aspect ratio
    if (options.responsive !== false) {
        setInterval(this.ResizeRenderArea, 100);
    }

    // Trigger our resize regardless because we may want an espect ratio but
    // not a reponsive monitor.
    setTimeout(this.ResizeRenderArea, 10);

    this.Update = function(instructions) {
        // Let our system know that we are ready to rock
        active = true;
       
        // Make sure our instructions are in an object format
        instructions = prepareArguments(instructions);

        // Inject our variables based on global params
        instructions['width'] = container.clientWidth;
        instructions['height'] = container.clientHeight;

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
        if (hasChanges == false) {
            var promise = ridestyler.promise();

            promise.resolve();

            return promise;
        }
        return renderer.Render(state);
    };


    this.Reset = function() {
        state = {};
        if (typeof renderer.Reset === 'function') renderer.Reset();
    };


    function prepareArguments(args) {
        var values = {};

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

        return values;
    }

    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    } 

    function RideStylerImageRenderer(container) {
        var activeImage = null;
        var retiredImages = [];

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
            var promise = ridestyler.promise();
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
            img.style.left = 0;
            img.style.top = 0;
            img.style.opacity = 0;
            img.style.transition = 'opacity linear 300ms';

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

            return promise;
        }
    }

    function createLoaderElement() {
        loader = document.createElement('img');

        // Set our image
        loader.src = '//static.ridestyler.net/images/loaders/loader_radial_chaser_back_on_white_32.gif';

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

