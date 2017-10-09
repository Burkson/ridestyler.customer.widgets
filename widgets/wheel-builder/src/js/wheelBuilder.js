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
		this.wheelEl = null;
		this.layerSelectEl = null;
		this.layerOptsEl = null;
		this.selectorEl = null;

		// The currently selected stack
		this.selectedStack = null;

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
			this.initTpl();
			this.asyncPromise.resolve();
		}
	};

	/**
	 * Initialize the template and select various elements for later
	 */
	WheelBuilder.prototype.initTpl = function() {
		this.container.innerHTML = this.tplHtml;

		this.wrapEl = document.getElementById('wb-wrapper');
		this.ctrlEl = this.wrapEl.getElementsByClassName('wb-ctrl-wrap')[0];
		this.wheelEl = this.wrapEl.getElementsByClassName('wb-wheel-wrap')[0];
		this.layerSelectEl = this.ctrlEl.getElementsByClassName('wb-layer-select')[0];
		this.layerOptsEl = this.ctrlEl.getElementsByClassName('wb-layer-options')[0];
		this.selectorEl = this.wheelEl.getElementsByClassName('wb-wheel-selector')[0];

		len = this.dirtyStacks.length;
		for (var i = 0; i < len; i++) {
			this.setLayerStack(this.dirtyStacks[i]);
		}
	};

	/**
	 * Select a stack and display it in the preview pane
	 */
	WheelBuilder.prototype.selectStack = function(stackName) {
		var self = this,
		stack = this.getLayerStack(stackName),
		layerSelectEl = this.layerSelectEl,
		len = stack.layers.length,
		layer = null,
		opts = null,
		a = null,
		colorSpan = null,
		li = null,
		selected = self.wheelEl.getElementsByClassName('wb-wheel-selected'),
		onclick = function(e) {
			var tgt = e.target,
			layerIdx = tgt.getAttribute('data-layeridx');

			self.showLayerOpts(stack, layerIdx);
		};

		// Hide the previously selected wheel
		if (selected.length > 0) {
			selected[0].style.opacity = 0;
			selected[0].style.display = 'none';
			removeClass(selected[0], 'wb-wheel-selected');
		}

		// Set our new stack as selected and show it
		addClass(stack.containEl, 'wb-wheel-selected');
		stack.containEl.style.display = 'block';
		self.selectedStack = stack.idx;

		// Display the stack name in the ctrl header
		this.ctrlEl.getElementsByClassName('wb-ctrl-title')[0].innerHTML = stack.name;

		// Clear layer selection pane
		layerSelectEl.innerHTML = '';
		layerSelectEl.style.display = 'block';
		self.layerOptsEl.style.display = 'none';

		// Loop through layers and create the control pane
		for (var i = 0; i < len; i++) {
			layer = stack.layers[i];

			if (layer.readOnly) {
				continue;
			}

			li = document.createElement('li');
			li.className = 'wb-ctrl-layer wb-ctrl-layer-' + layer.name;

			colorSpan = document.createElement('span');
			addClass(colorSpan, 'wb-color');
			if (layer.currentColor) {
				colorSpan.style.backgroundColor = layer.currentColor;
			}
			li.appendChild(colorSpan);

			a = document.createElement('a');
			a.href = '#';
			a.innerText = layer.label;
			a.setAttribute('data-layeridx', i);
			a.onclick = onclick;
		
			li.appendChild(a);
			layerSelectEl.appendChild(li);
		}

		stack.containEl.style.opacity = 1;
	};

	/**
	 * Render the selected layer options in the ctrl pane
	 */
	WheelBuilder.prototype.showLayerOpts = function(stack, layerIdx) {
		var self = this,
		layer = stack.layers[layerIdx],
		layerCtrl = self.layerSelectEl.getElementsByClassName('wb-ctrl-layer-' + layer.name)[0],
		opts = layer.options,
		li = null,
		colorLink = null,
		colorSpan = null,
		navLi = document.createElement('li'),
		back = document.createElement('button'),
		reset = document.createElement('button'),
		colorLinkOnclick = function(e) {
			var tgt = e.target,
			color = tgt.getAttribute('data-color');

			stack.lb.setColor(layer.name, color);
			layer.currentColor = color;
			layerCtrl.getElementsByTagName('span')[0].style.backgroundColor = color;
		};

		if (typeof opts !== 'object' || !opts.length) return;

		this.layerOptsEl.innerHTML = '';

		for (var i = 0, len = opts.length; i < len; i++) {
			if (typeof opts[i].name !== 'string' || !opts[i].name.trim()) {
				console.error('Invalid name provided for layer ' + layer.name + ' option');
				continue;
			}

			if (typeof opts[i].color !== 'string' || !opts[i].color.trim()) {
				console.error('Invalid color provided for layer ' + layer.name + ' option ' + opts.name);
				continue;
			}

			li = document.createElement('li');

			colorSpan = document.createElement('span');
			addClass(colorSpan, 'wb-color');
			colorSpan.style.backgroundColor = opts[i].color.trim();
			li.appendChild(colorSpan);

			colorLink = document.createElement('a');
			colorLink.href = '#';
			colorLink.innerHTML = opts[i].name.trim();
			colorLink.onclick = colorLinkOnclick;
			colorLink.setAttribute('data-color', opts[i].color.trim());
			li.appendChild(colorLink);

			this.layerOptsEl.appendChild(li);
		}


		back.innerText = 'Back';
		back.onclick = function() {
			self.layerSelectEl.style.display = 'block';
			self.layerOptsEl.style.display = 'none';
		};

		navLi.appendChild(back);

		reset.innerText = 'Reset';
		reset.onclick = function() {
			stack.lb.resetLayer(layer.name);
			layer.currentColor = '';
			layerCtrl.getElementsByTagName('span')[0].style.backgroundColor = '#FFF';
		};

		navLi.appendChild(reset);

		this.layerOptsEl.appendChild(navLi);

		// Hide layer selector and show layer opts
		this.layerSelectEl.style.display = 'none';
		this.layerOptsEl.style.display = 'block';
	};

	/**
	 * Set a stack of layers
	 */
	WheelBuilder.prototype.setLayerStack = function(ls) {
		var self = this;

		if (!ls || typeof ls !== 'object') {
			console.error('Invalid layer stack');
			return;
		}

		this.asyncPromise.done(function() {
			var exists = self.getLayerStack(ls.name),
			previewEl = self.wheelEl.getElementsByClassName('wb-wheel-preview')[0],
			layer = null,
			stackEl = null,
			lb = null,
			lowerName = '';

			if (!ls.name || !ls.name.trim()) {
				console.error('No name provided for layer stack');
				return;
			} else {
				ls.name = ls.name.trim();
				lowerName = ls.name.toLowerCase();
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

				//ls.layers[i] = layer;
			}

			if (exists) {
				stackEl = self.wheelEl.getElementById('wb-wheel-' + lowerName);
				stackEl.innerHTML = '';

				idx = self.stackLookup[ls.name];
				self.layerStacks[idx] = ls;
			} else {
				stackEl = document.createElement('div');
				stackEl.id = 'wb-wheel-' + lowerName;
				previewEl.appendChild(stackEl);

				idx = self.layerStacks.length;
				self.stackLookup[ls.name] = idx;
				self.layerStacks[idx] = ls;
			}
			stackEl.className = 'wb-wheel';

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
					stackEl.style.display = 'none';
				}
			});

			self.layerStacks[idx].lb = lb;
			self.layerStacks[idx].containEl = stackEl;
			self.layerStacks[idx].idx = idx;

			if (ls.visible) {
				self.visibleStacks++;

				if (ls.selected) {
					stackEl.className += ' wb-wheel-selected';
					self.selectedStack = idx;
					self.selectStack(ls.name);
				}
			}
		});
	};

	/**
	 * Add a selector to the list of stack selection items
	 */
	WheelBuilder.prototype.addStackSelector = function(ls) {
		var self = this,
		imgSrc = ls.lb.getImage(),
		img = new Image(),
		selector = this.selectorEl;
		li = document.createElement('li');

		img.src = imgSrc;
		li.appendChild(img);

		li.onclick = function() {
			var curSelected = self.wheelEl.getElementsByClassName('wb-stack-selected')[0];
			removeClass(curSelected, 'wb-stack-selected');
			addClass(li, 'wb-stack-selected');

			self.selectStack(ls.name);
		};

		if (ls.selected) {
			addClass(li, 'wb-stack-selected');
		}

		// REWRITE THIS
		if (!selector.children.length) {
			selector.appendChild(li);
		} else {
			var before = selector.children[ls.idx];
			if (before) {
				selector.insertBefore(li, before);
			} else {
				if (ls.idx >= selector.children.length) {
					selector.appendChild(li);
				} else {
					selector.insertBefore(li, selector.firstChild);
				}
			}
		}

		// Show the selector if we have multiple visible stacks
		if (this.visibleStacks > 1) {
			selector.style.opacity = 1;
		} else {
			selector.style.opacity = 0;
		}
	};

	/**
	 * Get a layer stack by name
	 */
	WheelBuilder.prototype.getLayerStack = function(stackName) {
		return this.stackLookup.hasOwnProperty(stackName) ? this.layerStacks[this.stackLookup[stackName]] : null;
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


	/*************************************************************************************************
	 UTILITY FUNCTIONS
	**************************************************************************************************/
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