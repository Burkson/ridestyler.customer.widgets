(function() {
	/**
	 * WheelBuilder: A customizable wheel building widget
	 * @constructor
	 * @param {string} containerId - The id of the container element
	 * @param {Array} layerStacks - An array of layer stacks
	 * @param {Object} opts - Optional arguments
	 */
	function WheelBuilder(containerId, layerStacks, opts) {
		var self = this,
		len = 0;

		if (!containerId || typeof containerId !== 'string') {
			console.error('Invalid container ID');
			return;
		}

		if (layerStacks && typeof layerStacks !== 'object') {
			console.error('Invalid layer stacks');
			return;
		}

		if (!LayerBuilder || typeof LayerBuilder !== 'function') {
			console.error('LayerBuilder not found');
			return;
		}

		if (typeof opts !== 'object') {
			opts = {};
		}

		if (opts.hasOwnProperty('defaultLayerOpts') && opts.defaultLayerOpts.length) {
			this.defaultLayerOpts = opts.defaultLayerOpts;
		} else {
			this.defaultLayerOpts = null;
		}

		// The id of the container element
		this.containerId = containerId;

		// The container element
		this.container = document.getElementById(containerId);

		// Stacks prior to validation
		this.dirtyStacks = layerStacks;

		// An array of layer stacks
		this.layerStacks = [];

		// Lookup stack by name
		this.stackLookup = {};

		// Number of visible stacks
		this.visibleStacks = 0;

		// Resolves after the container is loaded
		this.initPromise = new promise();

		// Resolves after async calls complete
		this.asyncPromise = new promise();

		// Resolves after all layers are set
		this.loadedPromise = new promise();

		// Flags to indicate individual async requests have completed
		this.tplLoaded = false;
		this.cssLoaded = false;

		// Paths to external files
		this.tplUrl = 'src/html/template.html';
		this.cssUrl = 'src/css/wheelBuilder.css';

		// Template content
		this.tplHtml = '';

		// Elements from the template we will be manipulating
		this.wrapEl = null;
		this.ctrlEl = null;
		this.selectorEl = null;
		this.layerSelectWrap = null;
		this.layerOptsWrap = null;

		// The currently selected stack
		this.selectedStack = null;

		// Default color operation
		this.dfltColorOp = 'multiply';

		if (!this.container) {
			document.addEventListener('DOMContentLoaded', function() {
				self.container = document.getElementById(self.containerId);
				self.initPromise.resolve();
				self.onDomReady();
			});
		} else {
			self.initPromise.resolve();
			self.onDomReady();
		}
	}

	/**
	 */
	 WheelBuilder.prototype.checkLoaded = function() {
		var len = this.layerStacks.length,
		loaded = 0;

		for (var i = 0; i < len; i++) {
			if (this.layerStacks[i].lb.loaded) {
				loaded++;
			}
		}

		if (loaded === len) {
			this.loadedPromise.resolve();
		}
	 };

	/**
	 * When the app is loaded, call a callback
	 * @param {function} cb - The callback function
	 */
	 WheelBuilder.prototype.loaded = function(cb) {
		this.loadedPromise.done(function() {
			cb.call();
		});
	 };

	/**
	 * When the dom is ready, fetch our css and template
	 */
	WheelBuilder.prototype.onDomReady = function() {
		var cb = this.onAsyncComplete;

		if (this.container == null) {
			console.error('Invalid container Id');
			return;
		}

		this.loadStyles(cb);
		this.loadTemplate(cb);
	};

	/**
	 * Resolve asyncPromise after async requests have completed
	 */
	WheelBuilder.prototype.onAsyncComplete = function() {
		if (this.tplLoaded && this.cssLoaded) {
			this.initApp();
			this.asyncPromise.resolve();
		}
	};

	/**
	 * Initialize the app
	 */
	WheelBuilder.prototype.initApp = function() {
		var self = this;

		if (!this.tplLoaded || !this.cssLoaded) {
			console.error('Template not loaded, unable to initialize app');
			return;
		}

		// Set the template html inside the container
		this.container.innerHTML = this.tplHtml;

		// Save these elements for later use
		this.wrapEl = document.getElementById('wb-wrapper');
		this.ctrlEl = this.wrapEl.getElementsByClassName('wb-ctrl-wrap')[0];
		this.layerSelectWrap = this.ctrlEl.getElementsByClassName('wb-layer-select')[0];
		this.layerOptsWrap = this.ctrlEl.getElementsByClassName('wb-layer-options')[0];
		this.selectorEl = this.wrapEl.getElementsByClassName('wb-wheel-selector')[0];

		var download = this.ctrlEl.getElementsByClassName('wb-download')[0];
		download.onclick = function(e) {
			self.exportSelectedStack(e);
		};

		// Create our layer stacks
		var len = this.dirtyStacks.length;
		for (var i = 0; i < len; i++) {
			this.addLayerStack(this.dirtyStacks[i]);
		}
	};

	/**
	 * Select a stack and display it in the preview pane
	 * @param {string} stackName - The newly selected stack name
	 */
	WheelBuilder.prototype.selectStack = function(stackName) {
		var self = this,
		curSelected = this.layerStacks[this.selectedStack],
		stack = this.getLayerStack(stackName);

		// Hide the current stack's layer selector
		if (curSelected) {
			if (curSelected.layerSelectEl) {
				toggle(null, curSelected.layerSelectEl);
			}
		}

		this.selectedStack = this.stackLookup[stackName];

		// Show this stack in the preview pane
		this.showPreviewStack(stack);

		// Display the stack name in the ctrl header
		this.setStackTitle(stack.name);

		// Show the layer selector or create if it doesn't exist
		if (stack.layerSelectEl) {
			toggle(stack.layerSelectEl);
		} else {
			this.createLayerSelector(stack, true);
		}

		toggle(this.layerSelectWrap, this.layerOptsWrap);
	};

	/**
	 * Create the layer selector and layer options panes for a layer stack
	 * @param {object} ls - The layer stack
	 */
	WheelBuilder.prototype.createLayerSelector = function(ls) {
		var self = this,
		len = ls.layers.length,
		layerClass = '',
		layer = null,
		colorSpan = null,
		textSpan = null,
		a = null,
		li = null,
		reset = null,
		ul = document.createElement('ul'),
		layerOnclick = function(e) {
			var tgt = e.target,
			layerIdx = null;

			if (tgt.tagName !== 'A') {
				tgt = tgt.parentElement;
			}

			layerIdx = parseInt(tgt.getAttribute('data-layeridx'));

			self.createLayerOpts(ls, layerIdx);
			toggle(self.layerOptsWrap, self.layerSelectWrap);
		};

		addClass(ul, 'wb-layer-selector');

		// Loop through layers and create the control pane
		for (var i = 0; i < len; i++) {
			layer = ls.layers[i];

			if (layer.readOnly) {
				continue;
			}

			layerClass = convertNameToClass(layer.name);
			a = document.createElement('a');
			li = document.createElement('li');
			colorSpan = document.createElement('span');
			textSpan = document.createElement('span');

			addClass(li, 'wb-ctrl-layer');
			addClass(li, 'wb-ctrl-layer-' + layerClass);
			addClass(colorSpan, 'wb-color');

			if (layer.currentColor) {
				colorSpan.style.backgroundColor = layer.currentColor;
			}

			textSpan.innerText = layer.name;

			a.appendChild(colorSpan);
			a.appendChild(textSpan);
			a.setAttribute('data-layeridx', i);
			a.onclick = layerOnclick;

			li.appendChild(a);
			ul.appendChild(li);
		}

		li = document.createElement('li');
		reset = document.createElement('button');
		reset.innerText = 'Reset All';
		reset.onclick = function() {
			self.resetAllLayers();
		};
		addClass(reset, 'wb-reset-all');

		li.appendChild(reset);
		ul.appendChild(li);

		ls.layerSelectEl = ul;
		this.layerSelectWrap.appendChild(ul);
	};

	/**
	 * Hide the previously selected preview stack and show a new one
	 * @param {object} stack - The stack we are showing
	 */
	WheelBuilder.prototype.showPreviewStack = function(stack) {
		var selected = this.wrapEl.getElementsByClassName('wb-wheel-selected');

		// Hide the previously selected wheel
		if (selected.length > 0) {
			selected[0].style.display = 'none';
			removeClass(selected[0], 'wb-wheel-selected');
		}

		// Set our new stack as selected and show it
		addClass(stack.containEl, 'wb-wheel-selected');
		stack.containEl.style.display = 'block';
		stack.containEl.style.opacity = 1;
	};

	/**
	 * Render the selected layer options in the ctrl pane
	 * @param {object} stack - The stack containing the layer we are working with
	 * @param {number} layerIdx - The index of the layer
	 */
	WheelBuilder.prototype.createLayerOpts = function(stack, layerIdx) {
		var self = this,
		layer = stack.layers[layerIdx],
		layerClass = convertNameToClass(layer.name),
		opts = layer.options,
		ul = null,
		back = null,
		reset = null,
		li = null,
		colorLink = null,
		colorSpan = null,
		colorText = null,
		colorOp = '',
		colorLinkOnclick = function(e) {
			var tgt = e.target,
			color = '',
			operation = '';

			if (tgt.tagName !== 'A') {
				tgt = tgt.parentElement;
			}

			color = tgt.getAttribute('data-color');
			operation = tgt.getAttribute('data-operation');

			self.setLayerColor(layer.name, color, operation);
		};

		if (typeof opts !== 'object' || !opts.length) return;

		// Clear out our previous options
		this.layerOptsWrap.innerHTML = '';

		ul = document.createElement('ul');
		back = document.createElement('button');
		reset = document.createElement('button');

		for (var i = 0, len = opts.length; i < len; i++) {
			if (typeof opts[i].name !== 'string' || !opts[i].name.trim()) {
				console.error('Invalid name provided for layer ' + layer.name + ' option');
				continue;
			}

			if (typeof opts[i].color !== 'string' || !opts[i].color.trim()) {
				console.error('Invalid color provided for layer ' + layer.name + ' option ' + opts.name);
				continue;
			}

			if (typeof opts[i].operation !== 'string' || stack.lb.getOperations().indexOf(opts[i].operation.toLowerCase()) === -1) {
				colorOp = this.dfltColorOp;
			} else {
				colorOp = opts[i].operation.trim().toLowerCase();
			}

			li = document.createElement('li');

			colorSpan = document.createElement('span');
			colorText = document.createElement('span');
			colorLink = document.createElement('a');

			addClass(colorSpan, 'wb-color');
			colorSpan.style.backgroundColor = opts[i].color.trim();
			colorLink.appendChild(colorSpan);

			colorText.innerHTML = opts[i].name.trim();
			colorLink.appendChild(colorText);

			colorLink.onclick = colorLinkOnclick;
			colorLink.setAttribute('data-color', opts[i].color.trim());
			colorLink.setAttribute('data-operation', colorOp);

			li.appendChild(colorLink);
			ul.appendChild(li);
		}

		this.layerOptsWrap.appendChild(ul);

		// Create back button
		back.innerText = 'Back';
		back.onclick = function() {
			toggle(self.layerSelectWrap, self.layerOptsWrap);
		};

		// Create reset button
		reset.innerText = 'Reset';
		reset.onclick = function() {
			self.resetLayer(layer.name);
		};

		this.layerOptsWrap.appendChild(back);
		this.layerOptsWrap.appendChild(reset);

		// Hide layer selector and show layer opts
		toggle(this.layerOptsWrap, this.layerSelectWrap);
	};

	/**
	 * Add a stack of layers
	 * @param {object} ls - Data represending the layer stack
	 */
	WheelBuilder.prototype.addLayerStack = function(ls) {
		var self = this;

		if (!ls || typeof ls !== 'object') {
			console.error('Invalid layer stack');
			return;
		}

		this.asyncPromise.done(function() {
			var exists = self.getLayerStack(ls.name),
			previewEl = self.wrapEl.getElementsByClassName('wb-wheel-preview')[0],
			layer = null,
			stackEl = null,
			lb = null,
			className = '';

			if (!ls.name || !ls.name.trim()) {
				console.error('No name provided for layer stack');
				return;
			} else {
				ls.name = ls.name.trim();
				className = convertNameToClass(ls.name.toLowerCase());
			}

			ls.visible = !!ls.visible;
			ls.selected = !!ls.selected;

			if (typeof ls.layers !== 'object' || !ls.layers.length) {
				console.error('No layers provided');
				return;
			}

			for (var i = 0, len = ls.layers.length; i < len; i++) {
				layer = ls.layers[i];

				if (typeof layer !== 'object') {
					console.error('Invalid layer for stack ' + ls.name);
					continue;
				}

				if (typeof layer.name !== 'string' || typeof layer.img !== 'string') {
					console.error('Layer name and img properties invalid for stack ' + ls.name);
					continue;
				} else {
					layer.name = layer.name.trim();
					layer.img = layer.img.trim();
					layer.label = typeof layer.label === 'string' && layer.label.trim() ? layer.label : layer.name;
				}
			
				layer.readOnly = !!layer.readOnly;

				if (!layer.options || typeof layer.options !== 'object' || !layer.options.length) {
					if (self.defaultLayerOpts.length) {
						layer.options = self.defaultLayerOpts;
					} else {
						layer.readOnly = true;
						layer.options = [];
					}
				}
			}

			if (exists) {
				stackEl = self.wrapEl.getElementById('wb-wheel-' + className);
				stackEl.innerHTML = '';

				idx = self.stackLookup[ls.name];
				self.layerStacks[idx] = ls;
			} else {
				stackEl = document.createElement('div');
				stackEl.id = 'wb-wheel-' + className;
				previewEl.appendChild(stackEl);

				idx = self.layerStacks.length;
				self.stackLookup[ls.name] = idx;
				self.layerStacks[idx] = ls;
			}
			addClass(stackEl, 'wb-wheel');

			// Set up the layer builder for this stack
			lb = new LayerBuilder(stackEl.id);
			lb.setLayers(ls.layers).done(function() {
				dims = lb.getDimensions();
				stackEl.style.width = dims.width + 'px';
				stackEl.style.height = dims.height + 'px';

				if (ls.visible) {
					self.addStackSelector(ls);
				}

				if (!ls.selected) {
					toggle(null, stackEl);
				}
			});

			lb.imgLoadPromise.done(function() {
				self.checkLoaded();
			});

			self.layerStacks[idx].lb = lb;
			self.layerStacks[idx].containEl = stackEl;
			self.layerStacks[idx].idx = idx;

			if (ls.visible) {
				self.visibleStacks++;

				if (ls.selected) {
					addClass(stackEl, 'wb-wheel-selected');
					self.selectedStack = idx;
					self.selectStack(ls.name);
				}
			}
		});
	};

	/**
	 * Add a selector to the list of stack selection items
	 * @param {object} ls - The layer stack for which we are adding a selector
	 */
	WheelBuilder.prototype.addStackSelector = function(ls) {
		var self = this,
		imgSrc = ls.lb.getImage(),
		img = new Image(),
		li = document.createElement('li');

		img.src = imgSrc;
		li.appendChild(img);

		li.onclick = function(e) {
			var tgt = e.target,
			item = tgt,
			curSelected = self.selectorEl.getElementsByClassName('wb-stack-selected')[0];

			if (tgt.tagName.toLowerCase !== 'li') {
				item = tgt.parentElement;
			}

			removeClass(curSelected, 'wb-stack-selected');

			self.selectStack(ls.name);

			addClass(item, 'wb-stack-selected');
		};

		if (ls.selected) {
			addClass(li, 'wb-stack-selected');
		}

		if (!this.selectorEl.children.length) {
			this.selectorEl.appendChild(li);
		} else {
			var before = this.selectorEl.children[ls.idx];
			if (before) {
				this.selectorEl.insertBefore(li, before);
			} else {
				if (ls.idx >= this.selectorEl.children.length) {
					this.selectorEl.appendChild(li);
				} else {
					this.selectorEl.insertBefore(li, this.selectorEl.firstChild);
				}
			}
		}

		// Show the selector if we have multiple visible stacks
		if (this.visibleStacks > 1) {
			this.selectorEl.style.opacity = 1;
		} else {
			this.selectorEl.style.opacity = 0;
		}
	};

	/**
	 * Set the color for a layer by name
	 * @param {string} layerName - The layer we are operating on
	 * @param {string} color - The color to which we are changing the layer
	 * @param {string} operation - The color operation being done
	 */
	WheelBuilder.prototype.setLayerColor = function(layerName, color, operation) {
		var len = this.layerStacks.length,
		len2 = null,
		stack = null,
		layerClass = convertNameToClass(layerName),
		ctrlColors = this.layerSelectWrap.getElementsByClassName('wb-ctrl-layer-' + layerClass);

		if (typeof layerName !== 'string' || !layerName.trim()) {
			console.error('Invalid layer name');
			return;
		}

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];

			if (stack.lb.getLayer(layerName)) {
				stack.lb.setColor(layerName, color, operation);
			}

			len2 = stack.layers.length;
			for (var j = 0; j < len2; j++) {
				if (stack.layers[j].name === layerName) {
					stack.layers[j].currentColor = color;
				}
			}
		}

		len = ctrlColors.length;
		for (i = 0; i < len; i++) {
			ctrlColors[i].getElementsByTagName('span')[0].style.backgroundColor = color;
		}
	};

	/**
	 * Reset all layers with the given name to its original state
	 * @param {string} layerName - The name of the layer to be reset
	 */
	WheelBuilder.prototype.resetLayer = function(layerName) {
		var len = this.layerStacks.length,
		len2 = null,
		stack = null,
		layerClass = convertNameToClass(layerName),
		ctrlColors = this.layerSelectWrap.getElementsByClassName('wb-ctrl-layer-' + layerClass);

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			stack.lb.resetLayer(layerName);

			len2 = stack.layers.length;
			for (var j = 0; j < len2; j++) {
				if (stack.layers[j].name === layerName) {
					stack.layers[j].currentColor = '';
				}
			}
		}

		len = ctrlColors.length;
		for (i = 0; i < len; i++) {
			ctrlColors[i].getElementsByTagName('span')[0].style.backgroundColor = '';
		}
	};

	/**
	 * Reset all layers to their original state
	 */
	WheelBuilder.prototype.resetAllLayers = function() {
		var len = this.layerStacks.length,
		len2 = null,
		stack = null,
		layerColors = this.ctrlEl.getElementsByClassName('wb-color');

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			stack.lb.resetAllLayers();

			len2 = stack.layers.length;
			for (var j = 0; j < len2; j++) {
				stack.layers[j].currentColor = '';
			}
		}

		len = layerColors.length;
		for (i = 0; i < len; i++) {
			layerColors[i].style.backgroundColor = '';
		}
	};

	/**
	 * Get a layer stack by name
	 * @param {string} stackname - Name of the stack to select
	 * @returns {object} The layer stack corresponding to stackName
	 */
	WheelBuilder.prototype.getLayerStack = function(stackName) {
		return this.stackLookup.hasOwnProperty(stackName) ? this.layerStacks[this.stackLookup[stackName]] : null;
	};

	/**
	 * Set the title of the control pane
	 * @param {string} title - The title to set
	 */
	WheelBuilder.prototype.setStackTitle = function(title) {
		if (typeof title === 'string') {
			this.ctrlEl.getElementsByClassName('wb-ctrl-title')[0].innerHTML = title;
		}
	};

	/**
	 * Fetch our html template via xhr
	 * @param {function} cb
	 */
	WheelBuilder.prototype.loadTemplate = function(cb) {
		var self = this,
		xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			var completed = 4;

			if (xhr.readyState === completed) {
				if (xhr.status === 200) {
					self.tplHtml = xhr.responseText;
					self.tplLoaded = true;

					if (typeof cb === 'function') {
						cb.apply(self);
					}
				} else {
					console.error('xhr request for template failed');
				}
			}
		};

		xhr.open('GET', this.tplUrl, true);
		xhr.send(null);
	};

	/**
	 * Insert our stylesheet into the <head>
	 * @param {function} cb
	 */
	WheelBuilder.prototype.loadStyles = function(cb) {
		var self = this,
		css = document.createElement('link'),
		head = document.getElementsByTagName('head')[0];

		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.href = this.cssUrl;

		css.onload = function() {
			if (!self.cssLoaded) {
				self.cssLoaded = true;

				if (typeof cb === 'function') {
					cb.apply(self);
				}
			}
		};

		head.insertBefore(css, head.firstElementChild);
	};

	/**
	 * Get the image data for the specified stack
	 * @param {string} stackName - The name of the stack to export
	 * @returns {string} A data:image string representing the stack
	 */
	WheelBuilder.prototype.getStackImage = function(stackName) {
		var stack = this.getLayerStack(stackName),
		display = null,
		imgData = null;

		// Hack to get the data url - canvas must be visible
		if (stack && stack.lb) {
			display = stack.containEl.style.display;
			stack.containEl.style.display = 'block';
			imgData = stack.lb.getImage();
			stack.containEl.style.display = display;
		}

		return imgData;
	};

	/**
	 * Download an image of the currently selected stack
	 * @param {object} e - The click event
	 */
	WheelBuilder.prototype.exportSelectedStack = function(e) {
		var a = e.target,
		stack = this.layerStacks[this.selectedStack],
		imgData = '';

		if (!stack || !stack.lb) {
			console.error('Cannot export: no stack selected');
			return;
		}

		imgData = this.getStackImage(stack.name);
		a.href = imgData;
		a.download = stack.name + '.png';
	};


	/*************************************************************************************************
	 UTILITY FUNCTIONS
	**************************************************************************************************/

	/**
	 * Convert a stack or layer name to a valid class name
	 * @param {string} name - String to convert
	 */
	var convertNameToClass = function(name) {
		return name.replace(/\W+/g, '-');
	};

	/**
	 * Swap visibility for two elements
	 * @param {object} showEl - Element to show
	 * @param {object} hideEl - Element to hide
	 */
	var toggle = function(showEl, hideEl) {
		if (showEl) {
			showEl.style.display = 'block';
			showEl.style.opacity = 1;
		}
		if (hideEl) {
			hideEl.style.display = 'none';
			hideEl.style.opacity = 0;
		}
	};

	/**
	 * Determines if element el has class cl
	 * @param {Element} el
	 * @param {string} cl
	 * @return {boolean}
	 */
	var hasClass = function (el, cl) {
		var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
		return !!el.className.match(regex);
	};

	/**
	 * Add class cl to element el
	 * @param {Element} el
	 * @param {string} cl
	 */
	var addClass = function (el, cl) {
		if (el.className.indexOf(cl) === -1) {
			el.className += ' ' + cl;
			el.className = el.className.trim();
		}
	};

	/**
	 * Remove class(es) from element el
	 * @param {Element} el
	 * @param {string|Array} cl
	 */
	var removeClass = function (el, cl) {
		var regex = null,
		len = 0;

		if (typeof cl !== 'object') {
			cl = [cl];
		}

		len = cl.length;
		for (var i = 0; i < len; i++) {
			regex = new RegExp('(?:\\s|^)' + cl[i] + '(?:\\s|$)');
			el.className = el.className.replace(regex, ' ');
		}
    };

	/**
	 * Promise implementation taken from RideStyler
	 * @returns {object} A promise object
     */
	function promise() {
        var states = {
            pending: 0,
            resolved: 1,
            rejected: 2
        },
        currentState = states.pending,
        currentValue = null,
        callbacks = [];

        return {
            state: function() {
                return currentState;
            },
            value: function() {
                return currentValue;
            },
            changeState: function(state,  value) {
                if (currentState === state) {
                    return console.error('Cannot changeState to same state: ' + state);
                }
                if (currentState !== states.pending) {
                    return console.error('Cannot changeState when promise is finalized.');
                }

                currentState = state;
                currentValue = value;
                resolve();

                return currentState;
            },
            resolve: function(value) {
                this.changeState(states.resolved, value);
            },
            reject: function(value) {
                this.changeState(states.rejected, value);
            },
            always: function(callback) {
                addCallback({ always: callback });
                return this;
            },
            done: function(callback) {
                addCallback({ done: callback });
                return this;
            },
            fail: function(callback) {
                addCallback({ fail: callback });
                return this;
            },
            isResolved: function() {
                return currentState === states.resolved;
            },
            isRejected: function() {
                return currentState === states.rejected;
            }
        };

        function addCallback(callback) {
            callbacks.push(callback);
            resolve();
        }

        function resolve() {
            if (currentState === states.pending) {
                return;
            }

            while (callbacks.length > 0) {
                var c = callbacks.shift();

                if (currentState === states.resolved &&
                    typeof c.done == 'function') {
                    c.done(currentValue);
                } else if (currentState === states.rejected && typeof c.fail === 'function') {
                    c.fail(currentValue);
                }

                if (typeof c.always == 'function') {
                    c.always(currentValue);
                }
            }
        }
    }

	window.WheelBuilder = WheelBuilder;
})();