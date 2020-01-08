(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate){
'use strict';

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

}).call(this,require("timers").setImmediate)

},{"timers":3}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":3}],4:[function(require,module,exports){
"use strict";

var _promisePolyfill = _interopRequireDefault(require("promise-polyfill"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  /**
   * Quick Select: Render the Quick Selct widget within a container element
   * @constructor
   * @param {number} containerId - The id of the widget's parent element
   * @param {Object} options - Optional arguments
   */
  function QuickSelect(containerId, options) {
    var vehicleModel = {},
        cdnUrl = options.devMode ? './src/' : 'https://static.ridestyler.net/widgets/quick-select/edge/',
        tplUrl = cdnUrl + 'html/qs.tpl',
        cssUrl = cdnUrl + 'css/qs.min.css',
        tplEl = null,
        container = null,
        bestConfigurationId = null,
        bestTireConfigId = null;
    options = options || {};
    /**
     * Load our template and styles if specified. Add event listeners to our selects.
     */

    function initializeWidget() {
      initializeContainer();
      loadTpl().then(function () {
        if (options.includeStyles) loadStyles();
        initializeUi();
      });
    }
    /**
     * Initialize our container element
     */


    function initializeContainer() {
      if (containerId) container = document.querySelector('#' + containerId);else console.error('the provided container is not valid.');
    }
    /**
     * Load the Quick Select tpl
     */


    function loadTpl() {
      return new _promisePolyfill["default"](function (resolve) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
          var completed = 4;

          if (xhr.readyState === completed) {
            if (xhr.status === 200) {
              container.innerHTML = xhr.responseText;
              tplEl = document.querySelector('#ridestyler-quick-select');
              resolve();
            } else {
              console.error('Quick Select template failed to load.');
            }
          }
        };

        xhr.open('GET', tplUrl, true);
        xhr.send(null);
      });
    }
    /**
     * Load our super special secret styles
     */


    function loadStyles() {
      var link = document.createElement('link');
      link.href = cssUrl;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    /**
     * Initialize our current vehicle selection selects with change event listeners
     */


    function initializeUi() {
      var yearEl = tplEl.querySelector('select[name=year]'),
          makeEl = tplEl.querySelector('select[name=make]'),
          modelEl = tplEl.querySelector('select[name=model]'),
          configTitle = tplEl.querySelector('#config-message');
      if (options.configTitle) configTitle.innerHTML = options.configTitle;
      loadNextStep();
      yearEl.addEventListener('change', function (event) {
        loadNextStep(event);
      });
      makeEl.addEventListener('change', function (event) {
        loadNextStep(event);
      });
      modelEl.addEventListener('change', function (event) {
        loadNextStep(event);
      });
    }
    /**
     * Load next vehicle selection step
     * @param {Event} e 
     */


    function loadNextStep(e) {
      var currentEl = e,
          currentSelection = null,
          vehicleSelectRequest = {
        Selection: []
      },
          loader = null;

      if (currentEl) {
        if (currentEl.target) currentEl = currentEl.target;
        if (currentEl.parentElement.lastElementChild.classList.contains('active-loader')) currentEl.parentElement.lastElementChild.classList.remove('active-loader');

        if (currentEl.parentElement.nextElementSibling && currentEl.parentElement.nextElementSibling.querySelector('.select-loader')) {
          loader = currentEl.parentElement.nextElementSibling.querySelector('.select-loader');
          loader.classList.add('active-loader');
        }

        currentSelection = currentEl.getAttribute('name');

        if (vehicleModel[currentSelection]) {
          // if the selection already exists
          vehicleModel[currentSelection] = currentEl.value;
          resetStepsAfter(currentSelection);
        } else {
          // else add it
          vehicleModel[currentSelection] = currentEl.value;
        }
      }

      for (var property in vehicleModel) {
        if (vehicleModel[property] != "") {
          if (property == 'tire') bestTireConfigId = vehicleModel[property];
          vehicleSelectRequest.Selection.push(property + ":" + vehicleModel[property]);
        }
      }

      if (currentSelection != 'tire') {
        ridestyler.ajax.send({
          action: 'Vehicle/Select',
          data: vehicleSelectRequest
        }).then(function (response) {
          if (response) {
            if (!vehicleModel[response.Menu.Key]) {
              //if key doesn't already exist in our vehicle model, add it and populate the select field
              vehicleModel[response.Menu.Key] = "";
              populateVehicleOptions(response.Menu);
            } else if (response.BestConfiguration) {
              //if we have our BestConfiguration set then we need to get our tire config
              bestConfigurationId = response.BestConfiguration.Value;
              getTireConfig();
            }
          }
        });
      } else {
        buildUrl();
      }
    }
    /**
     * Reset steps after current step
     * @param {String} currentStep 
     */


    function resetStepsAfter(currentStep) {
      var currentIndex = Object.keys(vehicleModel).indexOf(currentStep);

      for (var _i = 0, _Object$entries = Object.entries(vehicleModel); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        if (Object.keys(vehicleModel).indexOf(key) > currentIndex) {
          if (tplEl.querySelector('select[name=' + key + ']')) {
            destroyField(key);
            delete vehicleModel[key];
          }
        }
      }

      if (tplEl.querySelector('button')) tplEl.removeChild(tplEl.querySelector('button'));
    }
    /**
     * Populate a given select field with our given values
     * @param {Object} newFieldInfo 
     */


    function populateVehicleOptions(newFieldInfo, isTireOptions) {
      var selectElement = null,
          fieldInfo = {};

      if (isTireOptions) {
        //if these are tire options we know we need to generate a new field with info not from the passed data
        fieldInfo = {
          Key: 'tire',
          Label: 'Tire Option',
          Callback: loadNextStep
        };
        selectElement = generateNewField(fieldInfo);
      } else if (tplEl.querySelector('select[name=' + newFieldInfo.Key + ']')) {
        //else if the field already exists we want to use it
        selectElement = tplEl.querySelector('select[name=' + newFieldInfo.Key + ']');
      } else {
        //else we want to generate a new field
        fieldInfo.Label = newFieldInfo.Title;
        fieldInfo.Key = newFieldInfo.Key;
        fieldInfo.Callback = loadNextStep;
        selectElement = generateNewField(fieldInfo);
      }

      selectElement.removeAttribute('disabled');

      if (newFieldInfo.Options.length > 0) {
        //We want to make sure there are options first
        newFieldInfo.Options.forEach(function (option) {
          var optionEl = document.createElement('option');

          if (isTireOptions) {
            //if tire option we know the data is different
            optionEl.value = option.TireOptionID;
            optionEl.innerHTML = option.Front.Description;
            selectElement.appendChild(optionEl);
          } else {
            // else option data is always the same
            optionEl.value = option.Value;
            optionEl.innerHTML = option.Label;
            selectElement.appendChild(optionEl);
          }

          if (newFieldInfo.Options.length == 1) optionEl.setAttribute('selected', true); //check if there is only one option, if so select it
        });
      }

      selectElement.nextElementSibling.classList.remove('active-loader'); //remove loader on select element

      if (selectElement.value.indexOf('Select') == -1) loadNextStep(selectElement); //if there was only one option it's selected, move to next step.
    }
    /**
     * Generate a new field given the name and new values
     * @param {String} newFieldInfo 
     * @param {Array} options 
     */


    function generateNewField(newFieldInfo) {
      var newFieldDiv = document.createElement('div'),
          newFieldSelect = document.createElement('select'),
          newFieldLabel = document.createElement('label'),
          defaultOption = document.createElement('option'),
          selectLoader = document.createElement('div');
      selectLoader.classList.add('active-loader');
      selectLoader.classList.add('select-loader');
      newFieldDiv.classList.add('config-select');
      defaultOption.innerHTML = "Select a " + newFieldInfo.Key;
      newFieldLabel.innerHTML = newFieldInfo.Label;
      newFieldSelect.setAttribute('name', newFieldInfo.Key);
      newFieldSelect.addEventListener('change', function (event) {
        newFieldInfo.Callback(event);
      });
      newFieldSelect.appendChild(defaultOption);
      newFieldDiv.appendChild(newFieldLabel);
      newFieldDiv.appendChild(newFieldSelect);
      newFieldDiv.appendChild(selectLoader);
      tplEl.appendChild(newFieldDiv);
      return newFieldSelect;
    }
    /**
     * Shows availble tire configurations to the user
     */


    function getTireConfig() {
      return new _promisePolyfill["default"](function (resolve) {
        ridestyler.ajax.send({
          action: 'vehicle/gettireoptiondetails',
          data: {
            VehicleConfigurations: [bestConfigurationId]
          }
        }).then(function (response) {
          if (response && response.Details.length) {
            vehicleModel.tire = '';
            var tireOptions = {
              Options: response.Details
            };
            populateVehicleOptions(tireOptions, true);
          } else {
            buildUrl();
          }

          resolve();
        });
      });
    }
    /**
     * Build the url that will take users to the showcase with their configuration settings.
     */


    function buildUrl() {
      var url = "http://app.ridestyler.net/showcase?";

      if (options.apiKey) {
        url += options.apiKey + "#";
        if (bestConfigurationId) url += "vc=" + bestConfigurationId;
        if (bestTireConfigId) url += "&to=" + bestTireConfigId;
        showButton(url);
      } else {
        return new _promisePolyfill["default"](function (resolve) {
          getRSApiKey().then(function (apiKey) {
            url += apiKey + "#";
            if (bestConfigurationId) url += "vc=" + bestConfigurationId;
            if (bestTireConfigId) url += "&to=" + bestTireConfigId;
            showButton(url);
            resolve();
          });
        });
      }
    }
    /**
     * Get the users RideStyler api key
     * @returns {String}
     */


    function getRSApiKey() {
      return new _promisePolyfill["default"](function (resolve) {
        ridestyler.ajax.send({
          action: "ApiAccessKey/GetSharedKey"
        }).then(function (response) {
          if (response) {
            resolve(response.Key);
          }
        });
      });
    }
    /**
     * Show the button that will direct users to showcase given a url to the showcase.
     * @param {String}
     */


    function showButton(url) {
      var confirmButton = document.createElement('button');
      if (options.buttonText) confirmButton.innerHTML = options.buttonText;else confirmButton.innerHTML = "See Wheels";
      if (options.buttonClasses) options.buttonClasses.map(function (btnClass) {
        return confirmButton.classList.add(btnClass);
      }); //if user has super secret special button classes

      confirmButton.addEventListener('click', function () {
        window.open(url);
      });
      tplEl.appendChild(confirmButton);
    }
    /**
     * Remove element from the dom given the name attr of the element.
     * @param {String} key
     */


    function destroyField(key) {
      var fieldElement = tplEl.querySelector('select[name=' + key + ']');

      if (key !== "make" && key !== "model") {
        //if the key is not make or model, we just get rid of the selection completely
        if (tplEl.querySelector('select[name=' + key + ']')) {
          tplEl.removeChild(tplEl.querySelector('select[name=' + key + ']').parentElement);
        }
      } else {
        //if the key is make or model, we just remove the select options
        var disabledEl = document.createElement('option');
        disabledEl.setAttribute('disabled', true);
        disabledEl.setAttribute('selected', true);
        disabledEl.innerHTML = 'Select a ' + key;
        fieldElement.innerHTML = "";
        fieldElement.appendChild(disabledEl);
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      initializeWidget();
    });
  }

  window.QuickSelect = QuickSelect;
})();

},{"promise-polyfill":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QixHQUFxQixHQUF6QyxDQUFuQjs7QUFFQSxVQUFHLEdBQUcsS0FBSyxNQUFSLElBQWtCLEdBQUcsS0FBSyxPQUE3QixFQUFxQztBQUFFO0FBQ3RDLFlBQUcsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsaUJBQWdCLEdBQWhCLEdBQXFCLEdBQXpDLENBQUgsRUFBaUQ7QUFDaEQsVUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBZ0IsR0FBaEIsR0FBcUIsR0FBekMsRUFBOEMsYUFBaEU7QUFDQTtBQUNELE9BSkQsTUFJTztBQUFFO0FBQ1IsWUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBakI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLElBQXBDO0FBQ0EsUUFBQSxVQUFVLENBQUMsWUFBWCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztBQUNBLFFBQUEsVUFBVSxDQUFDLFNBQVgsR0FBdUIsY0FBYyxHQUFyQztBQUNBLFFBQUEsWUFBWSxDQUFDLFNBQWIsR0FBeUIsRUFBekI7QUFDQSxRQUFBLFlBQVksQ0FBQyxXQUFiLENBQXlCLFVBQXpCO0FBQ0E7QUFFRDs7QUFFRCxJQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTtBQUN2RCxNQUFBLGdCQUFnQjtBQUNoQixLQUZEO0FBR0E7O0FBRUQsRUFBQSxNQUFNLENBQUMsV0FBUCxHQUFxQixXQUFyQjtBQUNBLENBbFZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdGhpcyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gZmluYWxseUNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gIHJldHVybiB0aGlzLnRoZW4oXG4gICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn1cblxuLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbi8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxudmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuZnVuY3Rpb24gaXNBcnJheSh4KSB7XG4gIHJldHVybiBCb29sZWFuKHggJiYgdHlwZW9mIHgubGVuZ3RoICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbmZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5mdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLl9zdGF0ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IWJvb2xlYW59ICovXG4gIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtQcm9taXNlfHVuZGVmaW5lZH0gKi9cbiAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gIC8qKiBAdHlwZSB7IUFycmF5PCFGdW5jdGlvbj59ICovXG4gIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gIH1cbiAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZilcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgaWYgKFxuICAgICAgbmV3VmFsdWUgJiZcbiAgICAgICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICApIHtcbiAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3Qoc2VsZiwgZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHNlbGYuX3N0YXRlID0gMjtcbiAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgZmluYWxlKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgfVxuICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oXG4gICAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgZG9uZSA9IHRydWU7XG4gICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAvLyBAdHMtaWdub3JlXG4gIHZhciBwcm9tID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gIHJldHVybiBwcm9tO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA9IGZpbmFsbHlDb25zdHJ1Y3RvcjtcblxuUHJvbWlzZS5hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UuYWxsIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbChcbiAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UucmFjZSBhY2NlcHRzIGFuIGFycmF5JykpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZShhcnJbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG5Qcm9taXNlLl9pbW1lZGlhdGVGbiA9XG4gIC8vIEB0cy1pZ25vcmVcbiAgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICBmdW5jdGlvbihmbikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9KSB8fFxuICBmdW5jdGlvbihmbikge1xuICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgfTtcblxuUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCJpbXBvcnQgUHJvbWlzZSBmcm9tICdwcm9taXNlLXBvbHlmaWxsJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogUXVpY2sgU2VsZWN0OiBSZW5kZXIgdGhlIFF1aWNrIFNlbGN0IHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFF1aWNrU2VsZWN0KGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgdmVoaWNsZU1vZGVsID0ge30sXHJcblx0XHRcdGNkblVybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL3NyYy8nIDogJ2h0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIubmV0L3dpZGdldHMvcXVpY2stc2VsZWN0L2VkZ2UvJyxcclxuXHRcdFx0dHBsVXJsID0gY2RuVXJsICsgJ2h0bWwvcXMudHBsJyxcclxuXHRcdFx0Y3NzVXJsID0gY2RuVXJsICsgJ2Nzcy9xcy5taW4uY3NzJyxcclxuXHRcdFx0dHBsRWwgPSBudWxsLFxyXG5cdFx0XHRjb250YWluZXIgPSBudWxsLFxyXG5cdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVDb25maWdJZCA9IG51bGw7XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGlmIHNwZWNpZmllZC4gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBvdXIgc2VsZWN0cy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpe1xyXG5cdFx0XHRpbml0aWFsaXplQ29udGFpbmVyKCk7XHJcblx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYob3B0aW9ucy5pbmNsdWRlU3R5bGVzKSBsb2FkU3R5bGVzKCk7XHJcblx0XHRcdFx0aW5pdGlhbGl6ZVVpKCk7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjb250YWluZXIgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplQ29udGFpbmVyKCl7XHJcblx0XHRcdGlmKGNvbnRhaW5lcklkKSBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGNvbnRhaW5lcklkKTtcclxuXHRcdFx0ZWxzZSBjb25zb2xlLmVycm9yKCd0aGUgcHJvdmlkZWQgY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgdGhlIFF1aWNrIFNlbGVjdCB0cGxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFRwbCgpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcclxuXHRcdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRsZXQgY29tcGxldGVkID0gNDtcclxuXHRcdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gY29tcGxldGVkKSB7XHJcblx0XHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcclxuXHRcdFx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcclxuXHRcdFx0XHRcdFx0XHR0cGxFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyaWRlc3R5bGVyLXF1aWNrLXNlbGVjdCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdRdWljayBTZWxlY3QgdGVtcGxhdGUgZmFpbGVkIHRvIGxvYWQuJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHJcblx0XHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHRwbFVybCwgdHJ1ZSk7XHJcblx0XHRcdFx0eGhyLnNlbmQobnVsbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCBvdXIgc3VwZXIgc3BlY2lhbCBzZWNyZXQgc3R5bGVzXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRTdHlsZXMoKSB7XHJcblx0XHRcdGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xyXG5cdFx0XHRsaW5rLmhyZWYgPSBjc3NVcmw7XHJcblx0XHRcdGxpbmsudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcblx0XHRcdGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xyXG5cdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSW5pdGlhbGl6ZSBvdXIgY3VycmVudCB2ZWhpY2xlIHNlbGVjdGlvbiBzZWxlY3RzIHdpdGggY2hhbmdlIGV2ZW50IGxpc3RlbmVyc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplVWkoKXtcclxuXHRcdFx0bGV0IHllYXJFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPXllYXJdJyksXHJcblx0XHRcdFx0bWFrZUVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9bWFrZV0nKSxcclxuXHRcdFx0XHRtb2RlbEVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9bW9kZWxdJyksXHJcblx0XHRcdFx0Y29uZmlnVGl0bGUgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCcjY29uZmlnLW1lc3NhZ2UnKTtcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuY29uZmlnVGl0bGUpIGNvbmZpZ1RpdGxlLmlubmVySFRNTCA9IG9wdGlvbnMuY29uZmlnVGl0bGU7XHJcblxyXG5cdFx0XHRsb2FkTmV4dFN0ZXAoKTtcclxuXHJcblx0XHRcdHllYXJFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0XHRtYWtlRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bW9kZWxFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgbmV4dCB2ZWhpY2xlIHNlbGVjdGlvbiBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge0V2ZW50fSBlIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkTmV4dFN0ZXAoZSl7XHJcblx0XHRcdGxldCBjdXJyZW50RWwgPSBlLFxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsLFxyXG5cdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0ID0ge1NlbGVjdGlvbjpbXX0sXHJcblx0XHRcdFx0bG9hZGVyID0gbnVsbDtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGN1cnJlbnRFbCl7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnRhcmdldCkgY3VycmVudEVsID0gY3VycmVudEVsLnRhcmdldDtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlLWxvYWRlcicpKSBjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJykpe1xyXG5cdFx0XHRcdFx0bG9hZGVyID0gY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJyk7XHJcblx0XHRcdFx0XHRsb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y3VycmVudFNlbGVjdGlvbiA9IGN1cnJlbnRFbC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuXHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dKSB7IC8vIGlmIHRoZSBzZWxlY3Rpb24gYWxyZWFkeSBleGlzdHNcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTtcclxuXHRcdFx0XHRcdHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U2VsZWN0aW9uKTtcclxuXHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIGFkZCBpdFxyXG5cdFx0XHRcdFx0dmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dID0gY3VycmVudEVsLnZhbHVlOyBcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvcihsZXQgcHJvcGVydHkgaW4gdmVoaWNsZU1vZGVsKXtcclxuXHRcdFx0XHRpZih2ZWhpY2xlTW9kZWxbcHJvcGVydHldICE9IFwiXCIpe1xyXG5cdFx0XHRcdFx0aWYocHJvcGVydHkgPT0gJ3RpcmUnKSBiZXN0VGlyZUNvbmZpZ0lkID0gdmVoaWNsZU1vZGVsW3Byb3BlcnR5XTtcclxuXHRcdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0LlNlbGVjdGlvbi5wdXNoKFxyXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eSArIFwiOlwiICsgdmVoaWNsZU1vZGVsW3Byb3BlcnR5XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGN1cnJlbnRTZWxlY3Rpb24gIT0gJ3RpcmUnKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOidWZWhpY2xlL1NlbGVjdCcsIGRhdGE6dmVoaWNsZVNlbGVjdFJlcXVlc3R9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdFx0aWYoIXZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0peyAvL2lmIGtleSBkb2Vzbid0IGFscmVhZHkgZXhpc3QgaW4gb3VyIHZlaGljbGUgbW9kZWwsIGFkZCBpdCBhbmQgcG9wdWxhdGUgdGhlIHNlbGVjdCBmaWVsZFxyXG5cdFx0XHRcdFx0XHRcdHZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMocmVzcG9uc2UuTWVudSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZihyZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbil7IC8vaWYgd2UgaGF2ZSBvdXIgQmVzdENvbmZpZ3VyYXRpb24gc2V0IHRoZW4gd2UgbmVlZCB0byBnZXQgb3VyIHRpcmUgY29uZmlnXHJcblx0XHRcdFx0XHRcdFx0YmVzdENvbmZpZ3VyYXRpb25JZCA9IHJlc3BvbnNlLkJlc3RDb25maWd1cmF0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRcdGdldFRpcmVDb25maWcoKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgc3RlcHMgYWZ0ZXIgY3VycmVudCBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gY3VycmVudFN0ZXAgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U3RlcCl7XHJcblx0XHRcdGxldCBjdXJyZW50SW5kZXggPSBPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2YoY3VycmVudFN0ZXApO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZlaGljbGVNb2RlbCkpIHtcclxuXHRcdFx0XHRpZihPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2Yoa2V5KSA+IGN1cnJlbnRJbmRleCl7XHJcblx0XHRcdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsga2V5ICsgJ10nKSl7XHJcblx0XHRcdFx0XHRcdGRlc3Ryb3lGaWVsZChrZXkpO1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdmVoaWNsZU1vZGVsW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSkgdHBsRWwucmVtb3ZlQ2hpbGQodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQb3B1bGF0ZSBhIGdpdmVuIHNlbGVjdCBmaWVsZCB3aXRoIG91ciBnaXZlbiB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMobmV3RmllbGRJbmZvLCBpc1RpcmVPcHRpb25zKXtcclxuXHRcdFx0bGV0IHNlbGVjdEVsZW1lbnQgPSBudWxsLFxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHt9O1xyXG5cclxuXHRcdFx0aWYoaXNUaXJlT3B0aW9ucyl7IC8vaWYgdGhlc2UgYXJlIHRpcmUgb3B0aW9ucyB3ZSBrbm93IHdlIG5lZWQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGQgd2l0aCBpbmZvIG5vdCBmcm9tIHRoZSBwYXNzZWQgZGF0YVxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHtLZXk6ICd0aXJlJywgTGFiZWw6ICdUaXJlIE9wdGlvbicsIENhbGxiYWNrOiBsb2FkTmV4dFN0ZXB9O1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH0gZWxzZSBpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJykpeyAvL2Vsc2UgaWYgdGhlIGZpZWxkIGFscmVhZHkgZXhpc3RzIHdlIHdhbnQgdG8gdXNlIGl0XHJcblx0XHRcdFx0c2VsZWN0RWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBuZXdGaWVsZEluZm8uS2V5ICsgJ10nKTtcclxuXHRcdFx0fSBlbHNlIHsgLy9lbHNlIHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGRcclxuXHRcdFx0XHRmaWVsZEluZm8uTGFiZWwgPSBuZXdGaWVsZEluZm8uVGl0bGU7XHJcblx0XHRcdFx0ZmllbGRJbmZvLktleSA9IG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdFx0ZmllbGRJbmZvLkNhbGxiYWNrID0gbG9hZE5leHRTdGVwO1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID4gMCl7IC8vV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG9wdGlvbnMgZmlyc3RcclxuXHRcdFx0XHRuZXdGaWVsZEluZm8uT3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbil7XHJcblx0XHRcdFx0XHRsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRpcmUgb3B0aW9uIHdlIGtub3cgdGhlIGRhdGEgaXMgZGlmZmVyZW50XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlRpcmVPcHRpb25JRDtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkZyb250LkRlc2NyaXB0aW9uO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2Ugb3B0aW9uIGRhdGEgaXMgYWx3YXlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC5pbm5lckhUTUwgPSBvcHRpb24uTGFiZWw7XHJcblx0XHRcdFx0XHRcdHNlbGVjdEVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uRWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID09IDEpIG9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTsgLy9jaGVjayBpZiB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24sIGlmIHNvIHNlbGVjdCBpdFxyXG5cdFx0XHRcdH0pO1x0XHJcblx0XHRcdH0gXHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHQvL3JlbW92ZSBsb2FkZXIgb24gc2VsZWN0IGVsZW1lbnRcclxuXHRcdFx0aWYoc2VsZWN0RWxlbWVudC52YWx1ZS5pbmRleE9mKCdTZWxlY3QnKSA9PSAtMSkgbG9hZE5leHRTdGVwKHNlbGVjdEVsZW1lbnQpOyAvL2lmIHRoZXJlIHdhcyBvbmx5IG9uZSBvcHRpb24gaXQncyBzZWxlY3RlZCwgbW92ZSB0byBuZXh0IHN0ZXAuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZW5lcmF0ZSBhIG5ldyBmaWVsZCBnaXZlbiB0aGUgbmFtZSBhbmQgbmV3IHZhbHVlc1xyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5ld0ZpZWxkSW5mbyBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdlbmVyYXRlTmV3RmllbGQobmV3RmllbGRJbmZvKXtcclxuXHRcdFx0bGV0IG5ld0ZpZWxkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdFx0bmV3RmllbGRTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKSxcclxuXHRcdFx0XHRuZXdGaWVsZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKSxcclxuXHRcdFx0XHRkZWZhdWx0T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyksXHJcblx0XHRcdFx0c2VsZWN0TG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5jbGFzc0xpc3QuYWRkKCdjb25maWctc2VsZWN0Jyk7XHJcblx0XHRcdGRlZmF1bHRPcHRpb24uaW5uZXJIVE1MID0gXCJTZWxlY3QgYSBcIiArIG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdG5ld0ZpZWxkTGFiZWwuaW5uZXJIVE1MID0gbmV3RmllbGRJbmZvLkxhYmVsO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBuZXdGaWVsZEluZm8uS2V5KTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe25ld0ZpZWxkSW5mby5DYWxsYmFjayhldmVudCl9KTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3QuYXBwZW5kQ2hpbGQoZGVmYXVsdE9wdGlvbik7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKG5ld0ZpZWxkTGFiZWwpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChuZXdGaWVsZFNlbGVjdCk7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKHNlbGVjdExvYWRlcik7XHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKG5ld0ZpZWxkRGl2KTtcclxuXHJcblx0XHRcdHJldHVybiBuZXdGaWVsZFNlbGVjdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3dzIGF2YWlsYmxlIHRpcmUgY29uZmlndXJhdGlvbnMgdG8gdGhlIHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0VGlyZUNvbmZpZygpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjondmVoaWNsZS9nZXR0aXJlb3B0aW9uZGV0YWlscycsIGRhdGE6e1ZlaGljbGVDb25maWd1cmF0aW9uczogW2Jlc3RDb25maWd1cmF0aW9uSWRdfX0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UgJiYgcmVzcG9uc2UuRGV0YWlscy5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWwudGlyZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHRsZXQgdGlyZU9wdGlvbnMgPSB7T3B0aW9uczogcmVzcG9uc2UuRGV0YWlsc31cclxuXHRcdFx0XHRcdFx0cG9wdWxhdGVWZWhpY2xlT3B0aW9ucyh0aXJlT3B0aW9ucywgdHJ1ZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRidWlsZFVybCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEJ1aWxkIHRoZSB1cmwgdGhhdCB3aWxsIHRha2UgdXNlcnMgdG8gdGhlIHNob3djYXNlIHdpdGggdGhlaXIgY29uZmlndXJhdGlvbiBzZXR0aW5ncy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYnVpbGRVcmwoKXtcclxuXHRcdFx0bGV0IHVybCA9IFwiaHR0cDovL2FwcC5yaWRlc3R5bGVyLm5ldC9zaG93Y2FzZT9cIlxyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5hcGlLZXkpe1xyXG5cdFx0XHRcdHVybCArPSBvcHRpb25zLmFwaUtleSArIFwiI1wiO1xyXG5cdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRpZihiZXN0VGlyZUNvbmZpZ0lkKSB1cmwgKz0gXCImdG89XCIgKyBiZXN0VGlyZUNvbmZpZ0lkO1xyXG5cdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0XHRnZXRSU0FwaUtleSgpLnRoZW4oZnVuY3Rpb24oYXBpS2V5KXsgXHJcblx0XHRcdFx0XHRcdHVybCArPSBhcGlLZXkgKyBcIiNcIjsgXHJcblx0XHRcdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRcdFx0c2hvd0J1dHRvbih1cmwpO1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSB1c2VycyBSaWRlU3R5bGVyIGFwaSBrZXlcclxuXHRcdCAqIEByZXR1cm5zIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJTQXBpS2V5KCl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOlwiQXBpQWNjZXNzS2V5L0dldFNoYXJlZEtleVwifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UuS2V5KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3cgdGhlIGJ1dHRvbiB0aGF0IHdpbGwgZGlyZWN0IHVzZXJzIHRvIHNob3djYXNlIGdpdmVuIGEgdXJsIHRvIHRoZSBzaG93Y2FzZS5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzaG93QnV0dG9uKHVybCl7XHJcblx0XHRcdGxldCBjb25maXJtQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvblRleHQpIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gb3B0aW9ucy5idXR0b25UZXh0O1xyXG5cdFx0XHRlbHNlIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gXCJTZWUgV2hlZWxzXCI7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvbkNsYXNzZXMpIG9wdGlvbnMuYnV0dG9uQ2xhc3Nlcy5tYXAoYnRuQ2xhc3MgPT4gY29uZmlybUJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ0bkNsYXNzKSk7IC8vaWYgdXNlciBoYXMgc3VwZXIgc2VjcmV0IHNwZWNpYWwgYnV0dG9uIGNsYXNzZXNcclxuXHJcblx0XHRcdGNvbmZpcm1CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQoY29uZmlybUJ1dHRvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZW1vdmUgZWxlbWVudCBmcm9tIHRoZSBkb20gZ2l2ZW4gdGhlIG5hbWUgYXR0ciBvZiB0aGUgZWxlbWVudC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZGVzdHJveUZpZWxkKGtleSl7XHJcblx0XHRcdGxldCBmaWVsZEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJyk7XHJcblxyXG5cdFx0XHRpZihrZXkgIT09IFwibWFrZVwiICYmIGtleSAhPT0gXCJtb2RlbFwiKXsgLy9pZiB0aGUga2V5IGlzIG5vdCBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IGdldCByaWQgb2YgdGhlIHNlbGVjdGlvbiBjb21wbGV0ZWx5XHJcblx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpKXtcclxuXHRcdFx0XHRcdHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKS5wYXJlbnRFbGVtZW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7IC8vaWYgdGhlIGtleSBpcyBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IHJlbW92ZSB0aGUgc2VsZWN0IG9wdGlvbnNcclxuXHRcdFx0XHRsZXQgZGlzYWJsZWRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuaW5uZXJIVE1MID0gJ1NlbGVjdCBhICcgKyBrZXk7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmFwcGVuZENoaWxkKGRpc2FibGVkRWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRpbml0aWFsaXplV2lkZ2V0KCk7XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0d2luZG93LlF1aWNrU2VsZWN0ID0gUXVpY2tTZWxlY3Q7XHJcbn0pKCk7XHJcbiJdfQ==
