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

		// Default values
		this.colorOp = 'multiply';			// colorize operation
		this.pickerColor = 'FFFFFF';		// picker color
		this.ctrlTitleText = 'Customize';	// ctrl title text
		this.wheelDims = [];				// wheel dimensions
		this.imageType = 'image/png';		// image export type
		this.defaultLayerOpts = null;		// layer options
		this.cancelText = 'Cancel';
		this.confirmText = 'Confirm';
		this.onCancel = null;
		this.onConfirm = null;

		// Override defaults. Everything below this block cannot be overridden
		for (var i in opts) {
			if (this.hasOwnProperty(i)) {
				this[i] = opts[i];
			}
		}

		// Dev or production
		this.dev = opts.hasOwnProperty('dev') ? !!opts.dev : false;

		// The id of the container element
		this.containerId = containerId;

		// The container element
		this.container = document.getElementById(containerId);

		// Ids and class names of template elements
		this.wrapId = 'wb-wrapper';

		// Threshholds for adjusting layout
		this.smallWidth = 900;
		this.smallestWidth = 500;

		// Stacks prior to validation
		this.dirtyStacks = layerStacks;

		// An array of layer stacks
		this.layerStacks = [];

		// Lookup stack by name
		this.stackLookup = {};

		// Current layer colors
		this.layerColors = {};

		// Number of visible stacks
		this.visibleStacks = 0;

		// Resolves after the container is loaded
		this.initPromise = new LBUtil.promise();

		// Resolves after async calls complete
		this.asyncPromise = new LBUtil.promise();

		// Resolves after all layers are set
		this.loadedPromise = new LBUtil.promise();

		// Resolves after the app has initialized
		this.appLoadedPromise = new LBUtil.promise();

		// Flags to indicate individual async requests have completed
		this.tplLoaded = false;
		this.cssLoaded = false;
		this.extJsLoaded = false;

		// Paths to external files
		this.cdnUrl = 'https://rawgit.com/Burkson/com.burkson.ridestyler.widgets/master/widgets/wheel-builder/dist/';
		this.urlPfx = this.dev ? 'src/' : this.cdnUrl;
		this.tplUrl = this.urlPfx + 'html/template.html';

		if (opts.hasOwnProperty('cssUrl')) {
			this.cssUrl = typeof opts.cssUrl === 'string' ? opts.cssUrl : false;
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
		this.wheelPreview = null;
		this.ctrlWrap = null;
		this.selectorEl = null;
		this.layerSelectWrap = null;
		this.layerOptsWrap = null;
		this.topBar = null;
		this.ctrlHeader = null;
		this.ctrlTitle = null;
		this.ctrl = null;
		this.backBtn = null;
		this.closeBtn = null;

		// Width of our wheel preview wrapper
		this.previewWidth = 0;

		// Container width, used to determine if reinit is needed
		this.containerWidth = 0;

		// The currently selected stack
		this.selectedStack = null;

		// Set the dimensions of the wheel preview
		if (typeof opts.wheelDims === 'object' && opts.wheelDims.length === 2) {
			var w = parseInt(opts.wheelDims[0]),
			h = parseInt(opts.wheelDims[1]);

			if (!isNaN(w) && !isNaN(h)) {
				this.wheelDims = [w, h];
			}
		}

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
		this.appLoadedPromise.done(function() {
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
			console.error('Template not loaded');
			return;
		}

		// Set the template html inside the container
		if (!this.tplHtml) {
			console.error('No template specified');
			return;
		}

		this.container.innerHTML = this.tplHtml;

		// Save these elements for later use
		this.wrapEl = document.getElementById(this.wrapId);
		if (!this.wrapEl) {
			console.error('Unable to select wrapper element #' + this.wrapId);
			return;
		}

		this.containerWidth = this.container.offsetWidth;
		if (!this.containerWidth) {
			console.error('Container element has no width');
			return;
		}

		this.ctrlWrap = this.wrapEl.getElementsByClassName('wb-ctrl-wrap')[0];
		this.wheelPreview = this.wrapEl.getElementsByClassName('wb-wheel-preview')[0];
		this.selectorEl = this.wrapEl.getElementsByClassName('wb-wheel-selector')[0];
		this.layerSelectWrap = this.ctrlWrap.getElementsByClassName('wb-layer-select')[0];
		this.layerOptsWrap = this.ctrlWrap.getElementsByClassName('wb-layer-options')[0];
		this.topBar = this.wrapEl.getElementsByClassName('wb-top-bar')[0];
		this.logo = this.topBar.getElementsByClassName('wb-logo')[0];
		this.ctrlHeader = this.ctrlWrap.getElementsByClassName('wb-ctrl-header')[0];
		this.ctrlTitle = this.ctrlWrap.getElementsByClassName('wb-ctrl-title')[0];
		this.ctrl = this.ctrlWrap.getElementsByClassName('wb-ctrl')[0];
		this.backBtn = this.ctrlHeader.getElementsByClassName('wb-back-btn')[0];
		this.closeBtn = this.ctrlHeader.getElementsByClassName('wb-close-btn')[0];

		// Event handlers
		addResizeListener(this.container, function() {
			var newWidth = self.container.offsetWidth;
			if (self.containerWidth !== newWidth) {
				self.containerWidth = newWidth;

				self.appLoadedPromise.done(function() {
					self.reinitialize();
				});
			}
		});

		window.addEventListener('resize', function() {self.adjustLayout();});

		this.backBtn.onclick = function() {
			self.onBackClick();
		};

		this.closeBtn.onclick = function() {
			if (LBUtil.hasClass(self.ctrlWrap, 'wb-closed')) {
				LBUtil.removeClass(self.ctrlWrap, 'wb-closed');
				this.innerHTML = '[-]';
			} else {
				LBUtil.addClass(self.ctrlWrap, 'wb-closed');
				this.innerHTML = '[+]';
			}
		};

		this.adjustLayout();

		// Create each layer stack
		this.previewWidth = this.wheelPreview.clientWidth;
		for (var i = 0; i < len; i++) {
			this.addStack(this.dirtyStacks[i]);
		}

		// Perform tasks after all of the stacks have loaded
		this.loadedPromise.done(function() {
			self.initTop();
			self.renderCtrl();
			self.renderStackSelector();
			self.renderPreview();
			self.appLoadedPromise.resolve();
		});

		this.appLoadedPromise.done(function() {
			LBUtil.show(self.wrapEl, 'block', true);
		});
	};

	/**
	 * Initialize the top bar
	 */
	WheelBuilder.prototype.initTop = function() {
		var self = this,
		cancelBtn = this.topBar.getElementsByClassName('wb-top-button-left')[0],
		confirmBtn = this.topBar.getElementsByClassName('wb-top-button-right')[0],
		download = this.wrapEl.getElementsByClassName('wb-download')[0];

		if (this.onCancel) {
			cancelBtn.innerText = this.cancelText;
			cancelBtn.onclick = function() {
				self.onCancel.call();
			};
		} else {
			LBUtil.hide(cancelBtn);
		}

		if (this.onConfirm) {
			confirmBtn.innerText = this.confirmText;
			confirmBtn.onclick = function() {
				self.onConfirm.call();
			};
		} else {
			LBUtil.hide(confirmBtn);
		}

		if (download) {
			download.onclick = function(e) {
				self.onDownloadClick(e);
			};
		}

		LBUtil.show(this.topBar, 'table', true);
	};

	/**
	 * Adjust the widget layout depending on the container dimensions
	 */
	WheelBuilder.prototype.adjustLayout = function() {
		if (!this.container) return;

		var cWidth = this.container.offsetWidth;

		if (this.wrapEl) {
			if (cWidth <= this.smallestWidth) {
				if (!LBUtil.hasClass(this.wrapEl, 'wb-small')) {
					LBUtil.addClass(this.wrapEl, 'wb-small');
				}
				if (!LBUtil.hasClass(this.wrapEl, 'wb-smallest')) {
					LBUtil.addClass(this.wrapEl, 'wb-smallest');
				}
			} else if (cWidth <= this.smallWidth) {
				if (!LBUtil.hasClass(this.wrapEl, 'wb-small')) {
					LBUtil.addClass(this.wrapEl, 'wb-small');
				}
				LBUtil.removeClass(this.wrapEl, 'wb-smallest');
			} else {
				LBUtil.removeClass(this.wrapEl, ['wb-small', 'wb-smallest']);
			}
		}
	};

	/**
	 * Select a stack and display it in the preview pane
	 * @param {string} stackName - The name of the selected stack
	 */
	WheelBuilder.prototype.selectStack = function(stackName) {
		var curSelected = this.layerStacks[this.selectedStack],
		stack = this.getStack(stackName);

		// Create the layer selector for this stack
		if (!stack.layerSelectEl) {
			this.createLayerSelector(stack, true);
		}

		// Show this stack in the preview pane
		this.togglePreviewStack(stack);

		this.selectedStack = this.stackLookup[stackName];

		// Highlight the stack in the selector
		this.toggleSelectedStyle(stackName);
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
			LBUtil.toggle(self.layerOptsWrap, self.layerSelectWrap);
		};

		ul.innerHTML = '';

		LBUtil.addClass(ul, 'wb-layer-selector');

		// Loop through layers and create the control pane
		for (var i = 0; i < len; i++) {
			layer = ls.layers[i];

			if (layer.readOnly) {
				continue;
			}

			layerClass = LBUtil.nonAlpha2Dash(layer.name);
			a = document.createElement('a');
			li = document.createElement('li');
			colorSpan = document.createElement('span');
			textSpan = document.createElement('span');

			LBUtil.addClass(li, 'wb-ctrl-layer');
			LBUtil.addClass(li, 'wb-ctrl-layer-' + layerClass);
			LBUtil.addClass(colorSpan, 'wb-color');

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
		LBUtil.addClass(reset, 'wb-reset-all');

		buttonWrap = document.createElement('div');
		buttonWrap.appendChild(reset);
		LBUtil.addClass(buttonWrap, 'wb-button-wrap');
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
		layerClass = LBUtil.nonAlpha2Dash(layer.name),
		opts = layer.options,
		ul = null,
		li = null,
		resetLink = null,
		layerName = null,
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

		layerName.innerText = layer.name + ' -';
		LBUtil.show(layerName);
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
				colorOp = this.colorOp;
			} else {
				colorOp = opts[i].operation.trim().toLowerCase();
			}

			li = document.createElement('li');
			colorSpan = document.createElement('span');
			colorLink = document.createElement('a');

			LBUtil.addClass(colorSpan, 'wb-color');
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
		LBUtil.addClass(jscInput, 'jscolor');

		colorSpan = document.createElement('span');
		LBUtil.addClass(colorSpan, 'wb-color');
		LBUtil.addClass(colorSpan, 'wb-color-custom');

		li = document.createElement('li');
		LBUtil.addClass(li, 'wb-custom-color-wrap');

		jsColorLink = document.createElement('a');
		LBUtil.addClass(jsColorLink, 'wb-js-color');
		
		jsColorLink.innerHTML = '<span>&nbsp;Custom</span>';
		jsColorLink.setAttribute('title', 'Custom Color');
		jsColorLink.onclick = function() {
			jsColor.show();
		};

		jsColor = new jscolor(jscInput, {hash: true, closable: true});
		jsColor.fromString(layer.currentColor ? layer.currentColor : this.pickerColor);

		jsColor.onFineChange = function() {
			var parent = this.valueElement.parentElement,
			wbColor = parent.getElementsByClassName('wb-color-custom')[0],
			color = this.toHEXString();

			self.setLayerColor(layer.name, color);
			wbColor.style.backgroundColor = color;
		};

		jsColorLink.insertBefore(colorSpan, jsColorLink.firstElementChild);
		jsColorLink.appendChild(jscInput);

		li.appendChild(jsColorLink);
		ul.appendChild(li);

		// Set up reset button
		li = document.createElement('li');
		colorSpan = document.createElement('span');
		resetLink = document.createElement('a');
		resetLink.innerHTML = '<span> Reset</span>';

		LBUtil.addClass(colorSpan, 'wb-color');
		LBUtil.addClass(colorSpan, 'wb-color-reset');
		LBUtil.addClass(li, 'wb-reset-wrap');

		resetLink.insertBefore(colorSpan, resetLink.firstElementChild);
		li.appendChild(resetLink);

		resetLink.onclick = function() {
			jsColor.fromString(self.pickerColor);
			colorSpan.style.backgroundColor = '#' + self.pickerColor;
			self.resetLayer(layer.name);
		};

		ul.appendChild(li);

		LBUtil.show(this.backBtn, 'inline');

		LBUtil.toggle(this.layerOptsWrap, this.layerSelectWrap);
	};

	/**
	 * Add a stack of layers
	 * @param {object} ls - Data represending the layer stack - see readme for data format
	 */
	WheelBuilder.prototype.addStack = function(ls) {
		var self = this;

		if (!ls || typeof ls !== 'object') {
			console.error('Invalid layer stack');
			return;
		}

		this.asyncPromise.done(function() {
			var exists = self.getStack(ls.name),
			previewInner = self.wrapEl.getElementsByClassName('wb-wheel-preview-inner')[0],
			stackEl = null,
			lb = null,
			idx = null,
			dims = null,
			className = '';

			if (!ls.name || !ls.name.trim()) {
				console.error('No name provided for layer stack');
				return;
			} else {
				ls.name = ls.name.trim();
				className = LBUtil.nonAlpha2Dash(ls.name.toLowerCase());
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
				stackEl = document.getElementById('wb-wheel-' + className);
				stackEl.innerHTML = '';

				idx = self.stackLookup[ls.name];
				self.layerStacks[idx] = ls;
			} else {
				stackEl = document.createElement('div');
				stackEl.id = 'wb-wheel-' + className;
				previewInner.appendChild(stackEl);

				idx = self.layerStacks.length;
				self.stackLookup[ls.name] = idx;
				self.layerStacks[idx] = ls;
			}
			LBUtil.addClass(stackEl, 'wb-wheel');

			// Set up the layer builder for this stack
			lb = new LayerBuilder(stackEl.id, {dimensions: [self.previewWidth, self.previewWidth]});
			lb.setLayers(ls.layers).done(function() {
				dims = lb.getDimensions();
				stackEl.style.width = dims.width + 'px';
				stackEl.style.height = dims.height + 'px';

				if (ls.visible) {
					self.addStackSelector(ls);
				}

				if (!ls.selected) {
					LBUtil.hide(stackEl);
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
					LBUtil.addClass(stackEl, 'wb-wheel-selected');
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

		LBUtil.addClass(li, 'wb-ss-' + LBUtil.nonAlpha2Dash(ls.name.toLowerCase()));
		li.setAttribute('data-stackname', ls.name);
		li.appendChild(img);

		li.onclick = function(e) {
			var tgt = e.target,
			item = tgt,
			curSelected = self.selectorEl.getElementsByClassName('wb-stack-selected')[0];

			if (tgt.tagName.toLowerCase() !== 'li') {
				item = tgt.parentElement;
			}
			self.selectStack(ls.name);
		};

		if (ls.selected) {
			LBUtil.addClass(li, 'wb-stack-selected');
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
		selStack = this.layerStacks[this.selectedStack],
		layerClass = LBUtil.nonAlpha2Dash(layerName),
		ctrlColors = this.layerSelectWrap.getElementsByClassName('wb-ctrl-layer-' + layerClass);

		if (typeof layerName !== 'string' || !layerName.trim()) {
			console.error('Invalid layer name');
			return;
		}

		color = color.toUpperCase();
		layer = selStack.lb.getLayer(layerName);
		if (layer && !layer.readOnly) {
			selStack.lb.setColor(layerName, color, operation);
		}

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			len2 = stack.layers.length;

			for (var j = 0; j < len2; j++) {
				layer = stack.lb.getLayer(layerName);
				if (layer && !layer.readOnly &&
					stack.layers[j].name === layerName
				) {
					if (stack !== selStack) {
						stack.lb.setColor(layerName, color, operation);
					}
					stack.layers[j].currentColor = color;
					stack.layers[j].currentOp = operation;

					this.layerColors[layerName] = color;
				}
			}
		}

		len = ctrlColors.length;
		for (i = 0; i < len; i++) {
			ctrlColors[i].getElementsByTagName('span')[0].style.backgroundColor = color;
		}

		this.updateStackSelector();
	};

	/**
	 * Generate new thumbnails for the stack selector
	 */
	WheelBuilder.prototype.updateStackSelector = function() {
		var lis = this.selectorEl.getElementsByTagName('li'),
		len = lis.length,
		stack = null,
		img = null,
		stackName = '',
		dataUrl = '',
		display = '';

		for (var i = 0; i < len; i++) {
			stackName = lis[i].getAttribute('data-stackname');
			stack = this.getStack(stackName);
			img = lis[i].getElementsByTagName('img')[0];

			display = stack.containEl.style.display;
			if (display === 'none') {
				stack.containEl.style.display = 'block';
			}
			dataUrl = stack.lb.getImage();
			stack.containEl.style.display = display;

			img.setAttribute('src', dataUrl);
		}
	};

	/**
	 * Highlight the correct stack in the selector
	 */
	WheelBuilder.prototype.toggleSelectedStyle = function(stackName) {
		var curSelected = this.selectorEl.getElementsByClassName('wb-stack-selected')[0],
		nextSelected = this.selectorEl.getElementsByClassName('wb-ss-' + LBUtil.nonAlpha2Dash(stackName.toLowerCase()))[0];

		if (curSelected) {
			LBUtil.removeClass(curSelected, 'wb-stack-selected');
		}

		if (nextSelected) {
			LBUtil.addClass(nextSelected, 'wb-stack-selected');
		}
	};

	/**
	 * Reinitialize the app
	 */
	WheelBuilder.prototype.reinitialize = function() {
		var self = this,
		len = this.layerStacks.length,
		stack = null,
		parent = null,
		selectedStack = this.layerStacks[this.selectedStack].name;

		this.loadedPromise = new LBUtil.promise();

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			parent = stack.containEl.parentElement;
			parent.removeChild(stack.containEl);
		}

		this.layerStacks = [];
		this.selectorEl.innerHTML = '';

		this.adjustLayout();
		this.previewWidth = this.wheelPreview.clientWidth;

		for (i = 0; i < len; i++) {
			if (this.dirtyStacks[i].name === selectedStack) {
				this.dirtyStacks[i].selected = true;
			} else {
				this.dirtyStacks[i].selected = false;
			}

			this.addStack(this.dirtyStacks[i]);
		}

		this.loadedPromise.done(function() {
			for (i in self.layerColors) {
				self.setLayerColor(i, self.layerColors[i]);
			}
		});
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
			LBUtil.removeClass(curSelectEl, 'wb-wheel-selected');

			curSelected.layerSelectEl.style.opacity = 0;
		}

		setTimeout(function() {
			if (curSelectEl) {
				LBUtil.hide(curSelectEl);
				LBUtil.hide(curSelected.layerSelectEl);
			}

			// Set our new stack as selected and show it
			LBUtil.addClass(stack.containEl, 'wb-wheel-selected');
			stack.containEl.style.display = 'block';
			stack.containEl.clientWidth;
			stack.containEl.style.opacity = 1;

			stack.layerSelectEl.style.display = 'block';
			stack.layerSelectEl.clientWidth;
			stack.layerSelectEl.style.opacity = 1;

			// Show layer selector
			LBUtil.toggle(self.layerSelectWrap, self.layerOptsWrap);

			self.setStackTitle(stack.name);
		}, 250);
	};

	/**
	 * Show and style the ctrl pane
	 */
	WheelBuilder.prototype.renderCtrl = function() {
		LBUtil.show(this.ctrlWrap, 'table-cell', true, 0.87);
		this.setCtrlTitle();
	};

	/**
	 * Show the stack selector pane
	 */
	WheelBuilder.prototype.renderStackSelector = function() {
		if (this.visibleStacks > 1) {
			this.selectorEl.style.opacity = 1;
		} else {
			LBUtil.hide(this.selectorEl, true);
		}
	};

	/**
	 * Show the preview pane
	 */
	WheelBuilder.prototype.renderPreview = function() {
		if (this.wheelDims && this.wheelDims.length) {
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
		this.ctrlTitle.innerText = title ? title : this.ctrlTitleText;
	};

	/**
	 * Navigate back to the layer select view
	 */
	WheelBuilder.prototype.onBackClick = function() {
		this.setCtrlTitle();

		LBUtil.hide(this.backBtn);
		LBUtil.toggle(this.layerSelectWrap, this.layerOptsWrap);
	};

	/**
	 * Reset all layers with the given name to its original state
	 * @param {string} layerName - The name of the layer to be reset
	 */
	WheelBuilder.prototype.resetLayer = function(layerName) {
		var len = this.layerStacks.length,
		len2 = null,
		stack = null,
		layerClass = LBUtil.nonAlpha2Dash(layerName),
		ctrlColors = this.layerSelectWrap.getElementsByClassName('wb-ctrl-layer-' + layerClass);

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			stack.lb.resetLayer(layerName);

			len2 = stack.layers.length;
			for (var j = 0; j < len2; j++) {
				if (stack.layers[j].name === layerName) {
					stack.layers[j].currentColor = '';
					this.layerColors[layerName] = '';
				}
			}
		}

		len = ctrlColors.length;
		for (i = 0; i < len; i++) {
			ctrlColors[i].getElementsByTagName('span')[0].style.backgroundColor = '';
		}

		this.updateStackSelector();
	};

	/**
	 * Reset all layers to their original state
	 */
	WheelBuilder.prototype.resetAllLayers = function() {
		var len = this.layerStacks.length,
		len2 = null,
		stack = null,
		layerColors = this.layerSelectWrap.getElementsByClassName('wb-color');

		for (var i = 0; i < len; i++) {
			stack = this.layerStacks[i];
			stack.lb.resetAllLayers();

			len2 = stack.layers.length;
			for (var j = 0; j < len2; j++) {
				stack.layers[j].currentColor = '';
				this.layerColors[stack.layers[j].name] = '';
			}
		}

		len = layerColors.length;
		for (i = 0; i < len; i++) {
			layerColors[i].style.backgroundColor = '';
		}

		this.updateStackSelector();
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
	WheelBuilder.prototype.getStack = function(stackName) {
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
	 * @param {string} imgType - Optional type of image to export. 'image/png' by default
	 * @returns {string} A data:image string representing the stack
	 */
	WheelBuilder.prototype.getImage = function(stackName, imgType) {
		var stack = this.getStack(stackName),
		imgData = null;

		if (stack && stack.lb) {
			imgType = typeof imgType === 'string' ? imgType.trim() : this.imageType;
			imgData = stack.lb.getUnscaledImage(imgType);
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
		fileName = LBUtil.nonAlpha2Dash(stack.name) + '.png',
		imgData = '';

		if (!stack || !stack.lb) {
			console.error('Cannot export: no stack selected');
			return;
		}

		imgData = this.getImage(stack.name, this.imageType);

		if (window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(imgData, fileName);
		} else {
			a.href = imgData;
			a.download = fileName;
		}
	};

	window.WheelBuilder = WheelBuilder;

	// Element resize polyfill from
	// http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
	(function(){
	  var attachEvent = document.attachEvent;
	  var isIE = navigator.userAgent.match(/Trident/);
	  var requestFrame = (function(){
	    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
	        function(fn){ return window.setTimeout(fn, 20); };
	    return function(fn){ return raf(fn); };
	  })();

	  var cancelFrame = (function(){
	    var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
	           window.clearTimeout;
	    return function(id){ return cancel(id); };
	  })();

	  function resizeListener(e){
	    var win = e.target || e.srcElement;
	    if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
	    win.__resizeRAF__ = requestFrame(function(){
	      var trigger = win.__resizeTrigger__;
	      trigger.__resizeListeners__.forEach(function(fn){
	        fn.call(trigger, e);
	      });
	    });
	  }

	  function objectLoad(e){
	    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
	    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
	  }

	  window.addResizeListener = function(element, fn){
	    if (!element.__resizeListeners__) {
	      element.__resizeListeners__ = [];
	      if (attachEvent) {
	        element.__resizeTrigger__ = element;
	        element.attachEvent('onresize', resizeListener);
	      }
	      else {
	        if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
	        var obj = element.__resizeTrigger__ = document.createElement('object'); 
	        obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
	        obj.__resizeElement__ = element;
	        obj.onload = objectLoad;
	        obj.type = 'text/html';
	        if (isIE) element.appendChild(obj);
	        obj.data = 'about:blank';
	        if (!isIE) element.appendChild(obj);
	      }
	    }
	    element.__resizeListeners__.push(fn);
	  };

	  window.removeResizeListener = function(element, fn){
	    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
	    if (!element.__resizeListeners__.length) {
	      if (attachEvent) element.detachEvent('onresize', resizeListener);
	      else {
	        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
	        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
	      }
	    }
	  };
	})();
})();
