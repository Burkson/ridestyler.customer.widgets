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

		// Dev or production
		this.dev = opts.hasOwnProperty('dev') ? !!opts.dev : false;

		// The id of the container element
		this.containerId = containerId;

		// The container element
		this.container = document.getElementById(containerId);

		// Threshholds for adjusting layout
		this.smallWidth = 900;
		this.smallestWidth = 500;

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
		this.extJsLoaded = false;

		// Paths to external files
		this.cdnUrl = 'https://rawgit.com/Burkson/com.burkson.ridestyler.widgets/master/widgets/wheel-builder/dist/';
		this.urlPfx = this.dev ? 'src/' : this.cdnUrl;
		this.tplUrl = this.urlPfx + 'html/template.html';

		if (opts.hasOwnProperty('cssUrl')) {
			this.cssUrl = opts.cssUrl && typeof opts.cssUrl === 'string' ? opts.cssUrl : false;
		} else {
			this.cssUrl = this.dev ? this.urlPfx + 'css/wheelBuilder.css' : this.urlPfx + 'css/wheelBuilder.min.css';
		}

		if (!window.jscolor) {
			this.jsColorUrl = this.urlPfx + 'js/jscolor.min.js';
		}

		// Template content
		this.tplHtml = '';

		// Elements from the template we will be manipulating
		this.wrapEl = null;
		this.ctrlWrap = null;
		this.selectorEl = null;
		this.layerSelectWrap = null;
		this.layerOptsWrap = null;
		this.topBar = null;
		this.ctrlHeader = null;
		this.ctrlTitle = null;
		this.ctrl = null;
		this.backBtn = null;

		// The currently selected stack
		this.selectedStack = null;

		// Default values
		this.dfltColorOp = 'multiply';		// Default colorize operation
		this.dfltPickerColor = 'FFFFFF';	// Default picker color
		this.dfltCtrlTitle = 'Customize';	// Default ctrl title text
		this.dfltWheelDims = [500, 500];	// Default wheel dimensions

		// Set the dimensions of the wheel preview
		if (opts.hasOwnProperty('wheelDims') && typeof opts.wheelDims === 'object' && opts.wheelDims.length === 2) {
			var w = parseInt(opts.wheelDims[0]),
			h = parseInt(opts.wheelDims[1]);

			if (!isNaN(w) && !isNaN(h)) {
				this.wheelDims = [w, h];
			} else {
				this.wheelDims = this.dfltWheelDims;
			}
		} else {
			this.wheelDims = this.dfltWheelDims;
		}

		// Text and callbacks for top bar buttons
		this.cancelText = opts.cancelText ? opts.cancelText : 'Cancel';
		this.confirmText = opts.confirmText ? opts.confirmText : 'Confirm';
		this.onCancel = typeof opts.onCancel === 'function' ? opts.onCancel : null;
		this.onConfirm = typeof opts.onConfirm === 'function' ? opts.onConfirm : null;

		// Wait for DOMContentLoaded if the container doesn't exist yet
		if (!this.container) {
			document.addEventListener('DOMContentLoaded', function() {
				self.container = document.getElementById(self.containerId);
				if (!self.container) {
					console.error('Container does not exist');
				} else {
					self.initPromise.resolve();
					self.onDomReady();
				}
			});
		} else {
			self.initPromise.resolve();
			self.onDomReady();
		}
	}

	/**
	 * Check if all layer stacks have finished loading, resolve loadedPromise if so
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
	 * When the app is finished loading, execute a callback
	 * @param {function} cb - The callback function to execute
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

		this.loadExternalJs(cb);
		this.loadStyles(cb);
		this.loadTemplate(cb);
	};

	/**
	 * Check if all async requests have completed
	 * @returns {boolean} True if all async requests are complete
	 */
	WheelBuilder.prototype.isAsyncComplete = function() {
		return this.tplLoaded &&
			this.cssLoaded &&
			this.extJsLoaded;
	};

	/**
	 * Resolve asyncPromise after async requests have completed
	 */
	WheelBuilder.prototype.onAsyncComplete = function() {
		if (this.isAsyncComplete()) {
			this.initApp();
			this.asyncPromise.resolve();
		}
	};

	/**
	 * Initialize the app
	 */
	WheelBuilder.prototype.initApp = function() {
		var self = this,
		len = this.dirtyStacks.length;

		if (!this.isAsyncComplete()) {
			console.error('Template not loaded, unable to initialize app');
			return;
		}

		// Set the template html inside the container
		this.container.innerHTML = this.tplHtml;

		// Save these elements for later use
		this.wrapEl = document.getElementById('wb-wrapper');
		this.ctrlWrap = this.wrapEl.getElementsByClassName('wb-ctrl-wrap')[0];
		this.layerSelectWrap = this.ctrlWrap.getElementsByClassName('wb-layer-select')[0];
		this.layerOptsWrap = this.ctrlWrap.getElementsByClassName('wb-layer-options')[0];
		this.selectorEl = this.wrapEl.getElementsByClassName('wb-wheel-selector')[0];
		this.topBar = this.wrapEl.getElementsByClassName('wb-top-bar')[0];
		this.logo = this.topBar.getElementsByClassName('wb-logo')[0];
		this.ctrlHeader = this.ctrlWrap.getElementsByClassName('wb-ctrl-header')[0];
		this.ctrlTitle = this.ctrlWrap.getElementsByClassName('wb-ctrl-title')[0];
		this.ctrl = this.ctrlWrap.getElementsByClassName('wb-ctrl')[0];
		this.backBtn = this.ctrlHeader.getElementsByClassName('wb-back-btn')[0];

		this.initTop();

		// Event handlers
		window.addEventListener('resize', function() {self.adjustLayout();});

		// Create each layer stack
		for (var i = 0; i < len; i++) {
			this.addLayerStack(this.dirtyStacks[i]);
		}

		// Perform tasks after all of the stacks have loaded
		this.loadedPromise.done(function() {
			self.renderCtrl();
			self.renderStackSelector();
			self.renderPreview();
		});

		this.adjustLayout();
	};

	/**
	 * Initialize the top bar
	 */
	WheelBuilder.prototype.initTop = function() {
		var self = this,
		cancelBtn = this.topBar.getElementsByClassName('wb-top-button-left')[0],
		confirmBtn = this.topBar.getElementsByClassName('wb-top-button-right')[0];

		if (this.onCancel) {
			cancelBtn.innerText = this.cancelText;
			cancelBtn.onclick = function() {
				self.onCancel.call();
			};
		} else {
			hide(cancelBtn);
		}

		if (this.onConfirm) {
			confirmBtn.innerText = this.confirmText;
			confirmBtn.onclick = function() {
				self.onConfirm.call();
			};
		} else {
			hide(confirmBtn);
		}

		download = this.wrapEl.getElementsByClassName('wb-download')[0];
		download.onclick = function(e) {
			self.onDownloadClick(e);
		};

		this.backBtn.onclick = function() {
			self.onBackClick();
		};

		show(this.topBar, 'table', true);
	};

	/**
	 * Adjust the widget layout depending on the container dimensions
	 */
	WheelBuilder.prototype.adjustLayout = function() {
		if (!this.container) return;

		var cWidth = this.container.offsetWidth;

		if (this.wrapEl) {
			if (cWidth <= this.smallestWidth) {
				if (!hasClass(this.wrapEl, 'wb-small')) {
					addClass(this.wrapEl, 'wb-small');
				}
				if (!hasClass(this.wrapEl, 'wb-smallest')) {
					addClass(this.wrapEl, 'wb-smallest');
				}
			} else if (cWidth <= this.smallWidth) {
				if (!hasClass(this.wrapEl, 'wb-small')) {
					addClass(this.wrapEl, 'wb-small');
				}
				removeClass(this.wrapEl, 'wb-smallest');
			} else {
				removeClass(this.wrapEl, ['wb-small', 'wb-smallest']);
			}
		}
	};

	/**
	 * Select a stack and display it in the preview pane
	 * @param {string} stackName - The name of the selected stack
	 */
	WheelBuilder.prototype.selectStack = function(stackName) {
		var curSelected = this.layerStacks[this.selectedStack],
		stack = this.getLayerStack(stackName);

		// Create the layer selector for this stack
		if (!stack.layerSelectEl) {
			this.createLayerSelector(stack, true);
		}

		// Show this stack in the preview pane
		this.togglePreviewStack(stack);

		this.selectedStack = this.stackLookup[stackName];
	};

	/**
	 * Create the layer selector and layer options panes for a layer stack
	 * @param {object} ls - The layer stack we are displaying layers for
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
		buttonWrap = null,
		ul = document.createElement('ul'),
		layerOnclick = function(e) {
			var tgt = e.target,
			layerIdx = null;

			if (tgt.tagName !== 'A') {
				tgt = tgt.parentElement;
			}

			layerIdx = parseInt(tgt.getAttribute('data-layeridx'));

			self.showLayerOpts(ls, layerIdx);
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

			textSpan.innerText = layer.name + ' +';

			a.appendChild(colorSpan);
			a.appendChild(textSpan);
			a.setAttribute('data-layeridx', i);
			a.onclick = layerOnclick;

			li.appendChild(a);
			ul.appendChild(li);
		}

		li = document.createElement('li');

		/* Uncomment this to enable the reset all button
		reset = document.createElement('button');
		reset.innerText = 'Reset All';
		reset.onclick = function() {
			self.resetAllLayers();
		};
		addClass(reset, 'wb-reset-all');

		buttonWrap = document.createElement('div');
		buttonWrap.appendChild(reset);
		addClass(buttonWrap, 'wb-button-wrap');
		this.layerSelectWrap.appendChild(buttonWrap);
		*/

		ls.layerSelectEl = ul;
		this.layerSelectWrap.appendChild(ul);
	};

	/**
	 * Render the selected layer options in the ctrl pane
	 * @param {object} stack - The stack containing the layer we are working with
	 * @param {number} layerIdx - The index of the layer
	 */
	WheelBuilder.prototype.showLayerOpts = function(stack, layerIdx) {
		var self = this,
		layer = stack.layers[layerIdx],
		layerClass = convertNameToClass(layer.name),
		opts = layer.options,
		ul = null,
		reset = null,
		buttonWrap = null,
		layerName = null,
		li = null,
		colorLink = null,
		colorSpan = null,
		jscInput = null,
		jsColor = null,
		jsColorLink = null,
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

			jsColor.fromString(color);

			self.setLayerColor(layer.name, color, operation);
		};

		if (typeof opts !== 'object' || !opts.length) return;

		this.setCtrlTitle('Options');

		// Clear out our previous options
		this.layerOptsWrap.innerHTML = '';

		ul = document.createElement('ul');
		layerName = document.createElement('li');
		reset = document.createElement('button');

		layerName.innerText = layer.name + ' -';
		show(layerName);
		ul.appendChild(layerName);

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
			colorLink = document.createElement('a');

			addClass(colorSpan, 'wb-color');
			colorSpan.style.backgroundColor = opts[i].color.trim();
			colorLink.appendChild(colorSpan);

			colorLink.onclick = colorLinkOnclick;
			colorLink.setAttribute('data-color', opts[i].color.trim());
			colorLink.setAttribute('data-operation', colorOp);
			colorLink.setAttribute('title', opts[i].name);

			li.appendChild(colorLink);
			ul.appendChild(li);
		}

		this.layerOptsWrap.appendChild(ul);

		// Set up the custom color picker
		jscInput = document.createElement('input');
		addClass(jscInput, 'jscolor');
		colorSpan = document.createElement('span');
		addClass(colorSpan, 'wb-color');
		li = document.createElement('li');
		addClass(li, 'wb-custom-color');
		jsColorLink = document.createElement('a');
		addClass(jsColorLink, 'wb-js-color');
		
		jsColorLink.innerHTML = '<span> Custom Color</span>';
		jsColorLink.setAttribute('title', 'Custom Color');
		jsColorLink.onclick = function() {
			jsColor.show();
		};

		jsColor = new jscolor(jscInput, {hash: true, closable: true});
		jsColor.fromString(layer.currentColor ? layer.currentColor : this.dfltPickerColor);
		jsColor.onFineChange = function() {
			var color = this.toHEXString();
			self.setLayerColor(layer.name, color);
			colorSpan.style.backgroundColor = color;
		};

		jsColorLink.appendChild(jscInput);
		jsColorLink.insertBefore(colorSpan, jsColorLink.firstElementChild);

		li.appendChild(jsColorLink);
		ul.appendChild(li);

		buttonWrap = document.createElement('div');
		addClass(buttonWrap, 'wb-button-wrap');

		reset.innerText = 'Reset';
		reset.onclick = function() {
			jsColor.fromString(self.dfltPickerColor);
			colorSpan.style.backgroundColor = '#' + self.dfltPickerColor;
			self.resetLayer(layer.name);
		};

		buttonWrap.appendChild(reset);
		this.layerOptsWrap.appendChild(buttonWrap);

		show(this.backBtn, 'inline');

		toggle(this.layerOptsWrap, this.layerSelectWrap);
	};

	/**
	 * Add a stack of layers
	 * @param {object} ls - Data represending the layer stack - see readme for data format
	 */
	WheelBuilder.prototype.addLayerStack = function(ls) {
		var self = this;

		if (!ls || typeof ls !== 'object') {
			console.error('Invalid layer stack');
			return;
		}

		this.asyncPromise.done(function() {
			var exists = self.getLayerStack(ls.name),
			previewEl = self.wrapEl.getElementsByClassName('wb-wheel-preview-inner')[0],
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
				ls.layers[i] = self.validateLayer(ls.layers[i]);
				if (!ls.layers[i]) {
					ls.layers.splice(i, 1);
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
			lb = new LayerBuilder(stackEl.id, {dimensions: self.wheelDims});
			lb.setLayers(ls.layers).done(function() {
				dims = lb.getDimensions();
				stackEl.style.width = dims.width + 'px';
				stackEl.style.height = dims.height + 'px';

				if (ls.visible) {
					self.addStackSelector(ls);
				}

				if (!ls.selected) {
					hide(stackEl);
				}
			});

			// Resolve this promise after all stacks have loaded
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
		li = document.createElement('li'),
		before = null;

		img.src = imgSrc;
		li.appendChild(img);

		li.onclick = function(e) {
			var tgt = e.target,
			item = tgt,
			curSelected = self.selectorEl.getElementsByClassName('wb-stack-selected')[0];

			if (tgt.tagName.toLowerCase() !== 'li') {
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
			before = this.selectorEl.children[ls.idx];

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
		layer = null,
		layerClass = convertNameToClass(layerName),
		ctrlColors = this.layerSelectWrap.getElementsByClassName('wb-ctrl-layer-' + layerClass);

		if (typeof layerName !== 'string' || !layerName.trim()) {
			console.error('Invalid layer name');
			return;
		}

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			layer = stack.lb.getLayer(layerName);

			if (layer && !layer.readOnly) {
				stack.lb.setColor(layerName, color, operation);

				len2 = stack.layers.length;
				for (var j = 0; j < len2; j++) {
					if (stack.layers[j].name === layerName) {
						stack.layers[j].currentColor = color;
					}
				}
			}
		}

		len = ctrlColors.length;
		for (i = 0; i < len; i++) {
			ctrlColors[i].getElementsByTagName('span')[0].style.backgroundColor = color;
		}
	};

	/**
	 * Hide the previously selected preview stack and show a new one
	 * @param {object} stack - The stack we are showing
	 */
	WheelBuilder.prototype.togglePreviewStack = function(stack) {
		var self = this,
		curSelected = this.layerStacks[this.selectedStack],
		curSelectEl = null;

		// Hide the previously selected stack
		if (curSelected && curSelected !== stack) {
			curSelectEl = curSelected.containEl;
			curSelectEl.style.opacity = 0;
			removeClass(curSelectEl, 'wb-wheel-selected');

			curSelected.layerSelectEl.style.opacity = 0;
		}

		setTimeout(function() {
			if (curSelectEl) {
				hide(curSelectEl);
				hide(curSelected.layerSelectEl);
			}

			// Set our new stack as selected and show it
			addClass(stack.containEl, 'wb-wheel-selected');
			stack.containEl.style.display = 'block';
			stack.containEl.clientWidth;
			stack.containEl.style.opacity = 1;

			stack.layerSelectEl.style.display = 'block';
			stack.layerSelectEl.clientWidth;
			stack.layerSelectEl.style.opacity = 1;

			// Show layer selector
			toggle(self.layerSelectWrap, self.layerOptsWrap);

			self.setStackTitle(stack.name);
		}, 250);
	};

	/**
	 * Show and style the ctrl pane
	 */
	WheelBuilder.prototype.renderCtrl = function() {
		show(this.ctrlWrap, 'table-cell', true);
		this.setCtrlTitle();

		// Dynamically set the height of .wb-ctrl
		var ctrlHeight = parseInt(this.wheelDims[1] - this.ctrlHeader.clientHeight);
		if (!isNaN(ctrlHeight) && ctrlHeight > 0) {
			this.ctrl.style.height = ctrlHeight + 'px';
		}
	};

	/**
	 * Show the stack selector pane
	 */
	WheelBuilder.prototype.renderStackSelector = function() {
		if (this.visibleStacks > 1) {
			show(this.selectorEl, 'table-cell', true);
		} else {
			hide(this.selectorEl, true);
		}
	};

	/**
	 * Show the preview pane
	 */
	WheelBuilder.prototype.renderPreview = function() {
		if (this.wheelDims && this.wheelDims.length ) {
			var preview = this.wrapEl.getElementsByClassName('wb-wheel-preview-inner')[0];
			preview.style.width = this.wheelDims[0] + 'px';
			preview.style.height = this.wheelDims[1] + 'px';
		}
	};

	/**
	 * Set the title of the ctrl pane
	 * @param {string} title - The title section of the ctrl pane
	 */
	WheelBuilder.prototype.setCtrlTitle = function(title) {
		this.ctrlTitle.innerText = title ? title : this.dfltCtrlTitle;
	};

	/**
	 * Navigate back to the layer select view
	 */
	WheelBuilder.prototype.onBackClick = function() {
		this.setCtrlTitle();
		hide(this.backBtn);
		toggle(this.layerSelectWrap, this.layerOptsWrap);
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
		layerColors = this.ctrlWrap.getElementsByClassName('wb-color');

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
	 * Validate a stack layer
	 * @param {object} layer - The layer to validate
	 * @returns {object} The validated layer or false if invalid
	 */
	WheelBuilder.prototype.validateLayer = function(layer) {
		if (typeof layer !== 'object') {
			console.error('Invalid layer for stack ' + ls.name);
			return false;
		}

		if (typeof layer.name !== 'string' || typeof layer.img !== 'string') {
			console.error('Layer name and img properties invalid');
			return false;
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

		return layer;
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
			this.logo.innerText = title;
		}
	};

	/**
	 * Load external js and insert a new script tag into the head
	 */
	WheelBuilder.prototype.loadExternalJs = function(cb) {
		if (this.jsColorUrl) {
			var self = this,
			script = document.createElement('script'),
			head = document.getElementsByTagName('head')[0];

			script.type = 'text/javascript';
			script.src = this.jsColorUrl;

			script.onload = function() {
				if (!self.extJsLoaded) {
					self.extJsLoaded = true;

					if (typeof cb === 'function') {
						cb.apply(self);
					}
				}
			};

			head.insertBefore(script, head.firstElementChild);
		} else {
			this.extJsLoaded = true;
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
		if (!this.cssUrl) {
			this.cssLoaded = true;
			return;
		}

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
		imgData = null;

		if (stack && stack.lb) {
			imgData = stack.lb.getUnscaledImage();
		}

		return imgData;
	};

	/**
	 * Download an image of the currently selected stack
	 * @param {object} e - The click event
	 */
	WheelBuilder.prototype.onDownloadClick = function(e) {
		var a = e.target,
		stack = this.layerStacks[this.selectedStack],
		fileName = convertNameToClass(stack.name) + '.png',
		imgData = '';

		if (!stack || !stack.lb) {
			console.error('Cannot export: no stack selected');
			return;
		}

		imgData = this.getStackImage(stack.name);

		if (window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(imgData, fileName);
		} else {
			a.href = imgData;
			a.download = fileName;
		}
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
		if (hideEl) {
			hideEl.style.display = 'none';
			hideEl.style.opacity = 0;
		}
		if (showEl) {
			showEl.style.display = 'block';
			showEl.clientWidth;
			showEl.style.opacity = 1;
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

    var hide = function(el, opacity) {
		if (el && typeof el === 'object') {
			if (opacity) {
				el.style.opacity = 0;
			}
			el.style.display = 'none';
		}
    };

	var show = function(el, display, opacity) {
		if (el && typeof el === 'object') {
			el.style.display = display ? display : 'block';

			if (opacity) {
				el.style.opacity = 1;
			}
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