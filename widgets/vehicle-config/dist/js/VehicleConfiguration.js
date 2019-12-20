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
   * Vehicle Configuration: Render the Vehicle Configuration widget within a container element
   * @constructor
   * @param {number} containerId - The id of the widget's parent element
   * @param {Object} options - Optional arguments
   */
  function VehicleConfiguration(containerId, options) {
    var vehicleModel = {},
        cdnUrl = options.devMode ? './src/' : 'https://static.ridestyler.net/widgets/vehicle-configuration/edge/',
        tplUrl = cdnUrl + 'html/vc.tpl',
        cssUrl = cdnUrl + 'css/vc.min.css',
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
     * Load the Vehicle configuration tpl
     */


    function loadTpl() {
      return new _promisePolyfill["default"](function (resolve) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
          var completed = 4;

          if (xhr.readyState === completed) {
            if (xhr.status === 200) {
              container.innerHTML = xhr.responseText;
              tplEl = document.querySelector('#ridestyler-vehicle-config');
              resolve();
            } else {
              console.error('Vehicle configuration template failed to load.');
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
      };

      if (currentEl) {
        if (currentEl.target) currentEl = currentEl.target;
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
          defaultOption = document.createElement('option');
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
      tplEl.appendChild(newFieldDiv);
      return newFieldSelect;
    }
    /**
     * Shows availble tire configurations to the user
     */


    function getTireConfig() {
      ridestyler.ajax.send({
        action: 'vehicle/gettireoptiondetails',
        data: {
          VehicleConfigurations: [bestConfigurationId]
        }
      }).then(function (response) {
        if (response && response.Details.length) {
          var tireOptions = {
            Options: response.Details
          };
          populateVehicleOptions(tireOptions, true);
        } else {
          buildUrl();
        }
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
        getRSApiKey().then(function (apiKey) {
          url += apiKey + "#";
          if (bestConfigurationId) url += "vc=" + bestConfigurationId;
          if (bestTireConfigId) url += "&to=" + bestTireConfigId;
          showButton(url);
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

  window.VehicleConfiguration = VehicleConfiguration;
})();

},{"promise-polyfill":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvanMvVmVoaWNsZUNvbmZpZ3VyYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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WSxHQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFnQixHQUFoQixHQUFxQixHQUF6QyxDQUFuQjs7QUFFQSxVQUFHLEdBQUcsS0FBSyxNQUFSLElBQWtCLEdBQUcsS0FBSyxPQUE3QixFQUFxQztBQUFFO0FBQ3RDLFlBQUcsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsaUJBQWdCLEdBQWhCLEdBQXFCLEdBQXpDLENBQUgsRUFBaUQ7QUFDaEQsVUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBZ0IsR0FBaEIsR0FBcUIsR0FBekMsRUFBOEMsYUFBaEU7QUFDQTtBQUNELE9BSkQsTUFJTztBQUFFO0FBQ1IsWUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBakI7QUFDQSxRQUFBLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLElBQXBDO0FBQ0EsUUFBQSxVQUFVLENBQUMsWUFBWCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztBQUNBLFFBQUEsVUFBVSxDQUFDLFNBQVgsR0FBdUIsY0FBYyxHQUFyQztBQUNBLFFBQUEsWUFBWSxDQUFDLFNBQWIsR0FBeUIsRUFBekI7QUFDQSxRQUFBLFlBQVksQ0FBQyxXQUFiLENBQXlCLFVBQXpCO0FBQ0E7QUFFRDs7QUFFRCxJQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVTtBQUN2RCxNQUFBLGdCQUFnQjtBQUNoQixLQUZEO0FBR0E7O0FBQ0QsRUFBQSxNQUFNLENBQUMsb0JBQVAsR0FBOEIsb0JBQTlCO0FBQ0EsQ0E5VEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEB0aGlzIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBmaW5hbGx5Q29uc3RydWN0b3IoY2FsbGJhY2spIHtcbiAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHRoaXMudGhlbihcbiAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfVxuICApO1xufVxuXG4vLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBwcm9taXNlLXBvbHlmaWxsIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG52YXIgc2V0VGltZW91dEZ1bmMgPSBzZXRUaW1lb3V0O1xuXG5mdW5jdGlvbiBpc0FycmF5KHgpIHtcbiAgcmV0dXJuIEJvb2xlYW4oeCAmJiB0eXBlb2YgeC5sZW5ndGggIT09ICd1bmRlZmluZWQnKTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8vIFBvbHlmaWxsIGZvciBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cbmZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFByb21pc2UpKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9ICovXG4gIHRoaXMuX3N0YXRlID0gMDtcbiAgLyoqIEB0eXBlIHshYm9vbGVhbn0gKi9cbiAgdGhpcy5faGFuZGxlZCA9IGZhbHNlO1xuICAvKiogQHR5cGUge1Byb21pc2V8dW5kZWZpbmVkfSAqL1xuICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcbiAgLyoqIEB0eXBlIHshQXJyYXk8IUZ1bmN0aW9uPn0gKi9cbiAgdGhpcy5fZGVmZXJyZWRzID0gW107XG5cbiAgZG9SZXNvbHZlKGZuLCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlKHNlbGYsIGRlZmVycmVkKSB7XG4gIHdoaWxlIChzZWxmLl9zdGF0ZSA9PT0gMykge1xuICAgIHNlbGYgPSBzZWxmLl92YWx1ZTtcbiAgfVxuICBpZiAoc2VsZi5fc3RhdGUgPT09IDApIHtcbiAgICBzZWxmLl9kZWZlcnJlZHMucHVzaChkZWZlcnJlZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNlbGYuX2hhbmRsZWQgPSB0cnVlO1xuICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpIHtcbiAgICB2YXIgY2IgPSBzZWxmLl9zdGF0ZSA9PT0gMSA/IGRlZmVycmVkLm9uRnVsZmlsbGVkIDogZGVmZXJyZWQub25SZWplY3RlZDtcbiAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgIChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJldDtcbiAgICB0cnkge1xuICAgICAgcmV0ID0gY2Ioc2VsZi5fdmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChkZWZlcnJlZC5wcm9taXNlLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmVzb2x2ZShkZWZlcnJlZC5wcm9taXNlLCByZXQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZShzZWxmLCBuZXdWYWx1ZSkge1xuICB0cnkge1xuICAgIC8vIFByb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgaWYgKG5ld1ZhbHVlID09PSBzZWxmKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICBpZiAoXG4gICAgICBuZXdWYWx1ZSAmJlxuICAgICAgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG5ld1ZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICkge1xuICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuO1xuICAgICAgaWYgKG5ld1ZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICBzZWxmLl9zdGF0ZSA9IDM7XG4gICAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIGZpbmFsZShzZWxmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkb1Jlc29sdmUoYmluZCh0aGVuLCBuZXdWYWx1ZSksIHNlbGYpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHNlbGYuX3N0YXRlID0gMTtcbiAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGZpbmFsZShzZWxmKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJlamVjdChzZWxmLCBlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3Qoc2VsZiwgbmV3VmFsdWUpIHtcbiAgc2VsZi5fc3RhdGUgPSAyO1xuICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICBmaW5hbGUoc2VsZik7XG59XG5cbmZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG4gIGlmIChzZWxmLl9zdGF0ZSA9PT0gMiAmJiBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoID09PSAwKSB7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXNlbGYuX2hhbmRsZWQpIHtcbiAgICAgICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4oc2VsZi5fdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbGYuX2RlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGhhbmRsZShzZWxmLCBzZWxmLl9kZWZlcnJlZHNbaV0pO1xuICB9XG4gIHNlbGYuX2RlZmVycmVkcyA9IG51bGw7XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb21pc2UpIHtcbiAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbDtcbiAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbn1cblxuLyoqXG4gKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICovXG5mdW5jdGlvbiBkb1Jlc29sdmUoZm4sIHNlbGYpIHtcbiAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBmbihcbiAgICAgIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKHNlbGYsIHZhbHVlKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlamVjdChzZWxmLCByZWFzb24pO1xuICAgICAgfVxuICAgICk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICBkb25lID0gdHJ1ZTtcbiAgICByZWplY3Qoc2VsZiwgZXgpO1xuICB9XG59XG5cblByb21pc2UucHJvdG90eXBlWydjYXRjaCddID0gZnVuY3Rpb24ob25SZWplY3RlZCkge1xuICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIC8vIEB0cy1pZ25vcmVcbiAgdmFyIHByb20gPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcihub29wKTtcblxuICBoYW5kbGUodGhpcywgbmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb20pKTtcbiAgcmV0dXJuIHByb207XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZVsnZmluYWxseSddID0gZmluYWxseUNvbnN0cnVjdG9yO1xuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uKGFycikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignUHJvbWlzZS5hbGwgYWNjZXB0cyBhbiBhcnJheScpKTtcbiAgICB9XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgZnVuY3Rpb24gcmVzKGksIHZhbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICB2YXIgdGhlbiA9IHZhbC50aGVuO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhlbi5jYWxsKFxuICAgICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHJlamVjdChleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgfVxuICB9KTtcbn07XG5cblByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBQcm9taXNlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZWplY3QodmFsdWUpO1xuICB9KTtcbn07XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uKGFycikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCFpc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignUHJvbWlzZS5yYWNlIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKGFycltpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBVc2UgcG9seWZpbGwgZm9yIHNldEltbWVkaWF0ZSBmb3IgcGVyZm9ybWFuY2UgZ2FpbnNcblByb21pc2UuX2ltbWVkaWF0ZUZuID1cbiAgLy8gQHRzLWlnbm9yZVxuICAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGZ1bmN0aW9uKGZuKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0pIHx8XG4gIGZ1bmN0aW9uKGZuKSB7XG4gICAgc2V0VGltZW91dEZ1bmMoZm4sIDApO1xuICB9O1xuXG5Qcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlKSB7XG4gICAgY29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiIsInZhciBuZXh0VGljayA9IHJlcXVpcmUoJ3Byb2Nlc3MvYnJvd3Nlci5qcycpLm5leHRUaWNrO1xudmFyIGFwcGx5ID0gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGltbWVkaWF0ZUlkcyA9IHt9O1xudmFyIG5leHRJbW1lZGlhdGVJZCA9IDA7XG5cbi8vIERPTSBBUElzLCBmb3IgY29tcGxldGVuZXNzXG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFyVGltZW91dCk7XG59O1xuZXhwb3J0cy5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhckludGVydmFsKTtcbn07XG5leHBvcnRzLmNsZWFyVGltZW91dCA9XG5leHBvcnRzLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbih0aW1lb3V0KSB7IHRpbWVvdXQuY2xvc2UoKTsgfTtcblxuZnVuY3Rpb24gVGltZW91dChpZCwgY2xlYXJGbikge1xuICB0aGlzLl9pZCA9IGlkO1xuICB0aGlzLl9jbGVhckZuID0gY2xlYXJGbjtcbn1cblRpbWVvdXQucHJvdG90eXBlLnVucmVmID0gVGltZW91dC5wcm90b3R5cGUucmVmID0gZnVuY3Rpb24oKSB7fTtcblRpbWVvdXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csIHRoaXMuX2lkKTtcbn07XG5cbi8vIERvZXMgbm90IHN0YXJ0IHRoZSB0aW1lLCBqdXN0IHNldHMgdXAgdGhlIG1lbWJlcnMgbmVlZGVkLlxuZXhwb3J0cy5lbnJvbGwgPSBmdW5jdGlvbihpdGVtLCBtc2Vjcykge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gbXNlY3M7XG59O1xuXG5leHBvcnRzLnVuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG4gIGl0ZW0uX2lkbGVUaW1lb3V0ID0gLTE7XG59O1xuXG5leHBvcnRzLl91bnJlZkFjdGl2ZSA9IGV4cG9ydHMuYWN0aXZlID0gZnVuY3Rpb24oaXRlbSkge1xuICBjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7XG5cbiAgdmFyIG1zZWNzID0gaXRlbS5faWRsZVRpbWVvdXQ7XG4gIGlmIChtc2VjcyA+PSAwKSB7XG4gICAgaXRlbS5faWRsZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCkge1xuICAgICAgaWYgKGl0ZW0uX29uVGltZW91dClcbiAgICAgICAgaXRlbS5fb25UaW1lb3V0KCk7XG4gICAgfSwgbXNlY3MpO1xuICB9XG59O1xuXG4vLyBUaGF0J3Mgbm90IGhvdyBub2RlLmpzIGltcGxlbWVudHMgaXQgYnV0IHRoZSBleHBvc2VkIGFwaSBpcyB0aGUgc2FtZS5cbmV4cG9ydHMuc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0SW1tZWRpYXRlIDogZnVuY3Rpb24oZm4pIHtcbiAgdmFyIGlkID0gbmV4dEltbWVkaWF0ZUlkKys7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBmYWxzZSA6IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBpbW1lZGlhdGVJZHNbaWRdID0gdHJ1ZTtcblxuICBuZXh0VGljayhmdW5jdGlvbiBvbk5leHRUaWNrKCkge1xuICAgIGlmIChpbW1lZGlhdGVJZHNbaWRdKSB7XG4gICAgICAvLyBmbi5jYWxsKCkgaXMgZmFzdGVyIHNvIHdlIG9wdGltaXplIGZvciB0aGUgY29tbW9uIHVzZS1jYXNlXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2NhbGwtYXBwbHktc2VndVxuICAgICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5jYWxsKG51bGwpO1xuICAgICAgfVxuICAgICAgLy8gUHJldmVudCBpZHMgZnJvbSBsZWFraW5nXG4gICAgICBleHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBpZDtcbn07XG5cbmV4cG9ydHMuY2xlYXJJbW1lZGlhdGUgPSB0eXBlb2YgY2xlYXJJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IGNsZWFySW1tZWRpYXRlIDogZnVuY3Rpb24oaWQpIHtcbiAgZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF07XG59OyIsImltcG9ydCBQcm9taXNlIGZyb20gJ3Byb21pc2UtcG9seWZpbGwnO1xyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHQvKipcclxuXHQgKiBWZWhpY2xlIENvbmZpZ3VyYXRpb246IFJlbmRlciB0aGUgVmVoaWNsZSBDb25maWd1cmF0aW9uIHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFZlaGljbGVDb25maWd1cmF0aW9uKGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgdmVoaWNsZU1vZGVsID0ge30sXHJcblx0XHRcdGNkblVybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL3NyYy8nIDogJ2h0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIubmV0L3dpZGdldHMvdmVoaWNsZS1jb25maWd1cmF0aW9uL2VkZ2UvJyxcclxuXHRcdFx0dHBsVXJsID0gY2RuVXJsICsgJ2h0bWwvdmMudHBsJyxcclxuXHRcdFx0Y3NzVXJsID0gY2RuVXJsICsgJ2Nzcy92Yy5taW4uY3NzJyxcclxuXHRcdFx0dHBsRWwgPSBudWxsLFxyXG5cdFx0XHRjb250YWluZXIgPSBudWxsLFxyXG5cdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVDb25maWdJZCA9IG51bGw7XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGlmIHNwZWNpZmllZC4gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBvdXIgc2VsZWN0cy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpe1xyXG5cdFx0XHRpbml0aWFsaXplQ29udGFpbmVyKCk7XHJcblx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYob3B0aW9ucy5pbmNsdWRlU3R5bGVzKSBsb2FkU3R5bGVzKCk7XHJcblx0XHRcdFx0aW5pdGlhbGl6ZVVpKCk7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjb250YWluZXIgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplQ29udGFpbmVyKCl7XHJcblx0XHRcdGlmKGNvbnRhaW5lcklkKSBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGNvbnRhaW5lcklkKTtcclxuXHRcdFx0ZWxzZSBjb25zb2xlLmVycm9yKCd0aGUgcHJvdmlkZWQgY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgdGhlIFZlaGljbGUgY29uZmlndXJhdGlvbiB0cGxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFRwbCgpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcclxuXHRcdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRsZXQgY29tcGxldGVkID0gNDtcclxuXHRcdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gY29tcGxldGVkKSB7XHJcblx0XHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcclxuXHRcdFx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcclxuXHRcdFx0XHRcdFx0XHR0cGxFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyaWRlc3R5bGVyLXZlaGljbGUtY29uZmlnJyk7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ1ZlaGljbGUgY29uZmlndXJhdGlvbiB0ZW1wbGF0ZSBmYWlsZWQgdG8gbG9hZC4nKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblx0XHRcclxuXHRcdFx0XHR4aHIub3BlbignR0VUJywgdHBsVXJsLCB0cnVlKTtcclxuXHRcdFx0XHR4aHIuc2VuZChudWxsKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciBzdXBlciBzcGVjaWFsIHNlY3JldCBzdHlsZXNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFN0eWxlcygpIHtcclxuXHRcdFx0bGV0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0XHRcdGxpbmsuaHJlZiA9IGNzc1VybDtcclxuXHRcdFx0bGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHRcdFx0bGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjdXJyZW50IHZlaGljbGUgc2VsZWN0aW9uIHNlbGVjdHMgd2l0aCBjaGFuZ2UgZXZlbnQgbGlzdGVuZXJzXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVVaSgpe1xyXG5cdFx0XHRsZXQgeWVhckVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9eWVhcl0nKSxcclxuXHRcdFx0XHRtYWtlRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tYWtlXScpLFxyXG5cdFx0XHRcdG1vZGVsRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tb2RlbF0nKSxcclxuXHRcdFx0XHRjb25maWdUaXRsZSA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJyNjb25maWctbWVzc2FnZScpO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5jb25maWdUaXRsZSkgY29uZmlnVGl0bGUuaW5uZXJIVE1MID0gb3B0aW9ucy5jb25maWdUaXRsZTtcclxuXHJcblx0XHRcdGxvYWROZXh0U3RlcCgpO1xyXG5cclxuXHRcdFx0eWVhckVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHRcdG1ha2VFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0XHRtb2RlbEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCBuZXh0IHZlaGljbGUgc2VsZWN0aW9uIHN0ZXBcclxuXHRcdCAqIEBwYXJhbSB7RXZlbnR9IGUgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWROZXh0U3RlcChlKXtcclxuXHRcdFx0bGV0IGN1cnJlbnRFbCA9IGUsXHJcblx0XHRcdFx0Y3VycmVudFNlbGVjdGlvbiA9IG51bGwsXHJcblx0XHRcdFx0dmVoaWNsZVNlbGVjdFJlcXVlc3QgPSB7U2VsZWN0aW9uOltdfTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGN1cnJlbnRFbCl7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnRhcmdldCkgY3VycmVudEVsID0gY3VycmVudEVsLnRhcmdldDtcclxuXHRcdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gY3VycmVudEVsLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xyXG5cclxuXHRcdFx0XHRpZih2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0pIHsgLy8gaWYgdGhlIHNlbGVjdGlvbiBhbHJlYWR5IGV4aXN0c1xyXG5cdFx0XHRcdFx0dmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dID0gY3VycmVudEVsLnZhbHVlO1xyXG5cdFx0XHRcdFx0cmVzZXRTdGVwc0FmdGVyKGN1cnJlbnRTZWxlY3Rpb24pO1xyXG5cdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2UgYWRkIGl0XHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0gPSBjdXJyZW50RWwudmFsdWU7IFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yKGxldCBwcm9wZXJ0eSBpbiB2ZWhpY2xlTW9kZWwpe1xyXG5cdFx0XHRcdGlmKHZlaGljbGVNb2RlbFtwcm9wZXJ0eV0gIT0gXCJcIil7XHJcblx0XHRcdFx0XHRpZihwcm9wZXJ0eSA9PSAndGlyZScpIGJlc3RUaXJlQ29uZmlnSWQgPSB2ZWhpY2xlTW9kZWxbcHJvcGVydHldO1xyXG5cdFx0XHRcdFx0dmVoaWNsZVNlbGVjdFJlcXVlc3QuU2VsZWN0aW9uLnB1c2goXHJcblx0XHRcdFx0XHRcdHByb3BlcnR5ICsgXCI6XCIgKyB2ZWhpY2xlTW9kZWxbcHJvcGVydHldXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoY3VycmVudFNlbGVjdGlvbiAhPSAndGlyZScpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J1ZlaGljbGUvU2VsZWN0JywgZGF0YTp2ZWhpY2xlU2VsZWN0UmVxdWVzdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0XHRpZighdmVoaWNsZU1vZGVsW3Jlc3BvbnNlLk1lbnUuS2V5XSl7IC8vaWYga2V5IGRvZXNuJ3QgYWxyZWFkeSBleGlzdCBpbiBvdXIgdmVoaWNsZSBtb2RlbCwgYWRkIGl0IGFuZCBwb3B1bGF0ZSB0aGUgc2VsZWN0IGZpZWxkXHJcblx0XHRcdFx0XHRcdFx0dmVoaWNsZU1vZGVsW3Jlc3BvbnNlLk1lbnUuS2V5XSA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdFx0cG9wdWxhdGVWZWhpY2xlT3B0aW9ucyhyZXNwb25zZS5NZW51KTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmKHJlc3BvbnNlLkJlc3RDb25maWd1cmF0aW9uKXsgLy9pZiB3ZSBoYXZlIG91ciBCZXN0Q29uZmlndXJhdGlvbiBzZXQgdGhlbiB3ZSBuZWVkIHRvIGdldCBvdXIgdGlyZSBjb25maWdcclxuXHRcdFx0XHRcdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gcmVzcG9uc2UuQmVzdENvbmZpZ3VyYXRpb24uVmFsdWU7XHJcblx0XHRcdFx0XHRcdFx0Z2V0VGlyZUNvbmZpZygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgc3RlcHMgYWZ0ZXIgY3VycmVudCBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gY3VycmVudFN0ZXAgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U3RlcCl7XHJcblx0XHRcdGxldCBjdXJyZW50SW5kZXggPSBPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2YoY3VycmVudFN0ZXApO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZlaGljbGVNb2RlbCkpIHtcclxuXHRcdFx0XHRpZihPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2Yoa2V5KSA+IGN1cnJlbnRJbmRleCl7XHJcblx0XHRcdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsga2V5ICsgJ10nKSl7XHJcblx0XHRcdFx0XHRcdGRlc3Ryb3lGaWVsZChrZXkpO1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdmVoaWNsZU1vZGVsW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSkgdHBsRWwucmVtb3ZlQ2hpbGQodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQb3B1bGF0ZSBhIGdpdmVuIHNlbGVjdCBmaWVsZCB3aXRoIG91ciBnaXZlbiB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMobmV3RmllbGRJbmZvLCBpc1RpcmVPcHRpb25zKXtcclxuXHRcdFx0bGV0IHNlbGVjdEVsZW1lbnQgPSBudWxsLFxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHt9O1xyXG5cclxuXHRcdFx0aWYoaXNUaXJlT3B0aW9ucyl7IC8vaWYgdGhlc2UgYXJlIHRpcmUgb3B0aW9ucyB3ZSBrbm93IHdlIG5lZWQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGQgd2l0aCBpbmZvIG5vdCBmcm9tIHRoZSBwYXNzZWQgZGF0YVxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHtLZXk6ICd0aXJlJywgTGFiZWw6ICdUaXJlIE9wdGlvbicsIENhbGxiYWNrOiBsb2FkTmV4dFN0ZXB9O1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH0gZWxzZSBpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJykpeyAvL2Vsc2UgaWYgdGhlIGZpZWxkIGFscmVhZHkgZXhpc3RzIHdlIHdhbnQgdG8gdXNlIGl0XHJcblx0XHRcdFx0c2VsZWN0RWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBuZXdGaWVsZEluZm8uS2V5ICsgJ10nKTtcclxuXHRcdFx0fSBlbHNlIHsgLy9lbHNlIHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGRcclxuXHRcdFx0XHRmaWVsZEluZm8uTGFiZWwgPSBuZXdGaWVsZEluZm8uVGl0bGU7XHJcblx0XHRcdFx0ZmllbGRJbmZvLktleSA9IG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdFx0ZmllbGRJbmZvLkNhbGxiYWNrID0gbG9hZE5leHRTdGVwO1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID4gMCl7IC8vV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG9wdGlvbnMgZmlyc3RcclxuXHRcdFx0XHRuZXdGaWVsZEluZm8uT3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbil7XHJcblx0XHRcdFx0XHRsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRpcmUgb3B0aW9uIHdlIGtub3cgdGhlIGRhdGEgaXMgZGlmZmVyZW50XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlRpcmVPcHRpb25JRDtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkZyb250LkRlc2NyaXB0aW9uO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2Ugb3B0aW9uIGRhdGEgaXMgYWx3YXlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC5pbm5lckhUTUwgPSBvcHRpb24uTGFiZWw7XHJcblx0XHRcdFx0XHRcdHNlbGVjdEVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uRWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID09IDEpIG9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTsgLy9jaGVjayBpZiB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24sIGlmIHNvIHNlbGVjdCBpdFxyXG5cdFx0XHRcdH0pO1x0XHJcblx0XHRcdH0gXHJcblxyXG5cdFx0XHRpZihzZWxlY3RFbGVtZW50LnZhbHVlLmluZGV4T2YoJ1NlbGVjdCcpID09IC0xKSBsb2FkTmV4dFN0ZXAoc2VsZWN0RWxlbWVudCk7IC8vaWYgdGhlcmUgd2FzIG9ubHkgb25lIG9wdGlvbiBpdCdzIHNlbGVjdGVkLCBtb3ZlIHRvIG5leHQgc3RlcC5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdlbmVyYXRlIGEgbmV3IGZpZWxkIGdpdmVuIHRoZSBuYW1lIGFuZCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucyBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2VuZXJhdGVOZXdGaWVsZChuZXdGaWVsZEluZm8pe1xyXG5cdFx0XHRsZXQgbmV3RmllbGREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuXHRcdFx0XHRuZXdGaWVsZFNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpLFxyXG5cdFx0XHRcdG5ld0ZpZWxkTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpLFxyXG5cdFx0XHRcdGRlZmF1bHRPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHJcblx0XHRcdG5ld0ZpZWxkRGl2LmNsYXNzTGlzdC5hZGQoJ2NvbmZpZy1zZWxlY3QnKTtcclxuXHRcdFx0ZGVmYXVsdE9wdGlvbi5pbm5lckhUTUwgPSBcIlNlbGVjdCBhIFwiICsgbmV3RmllbGRJbmZvLktleTtcclxuXHRcdFx0bmV3RmllbGRMYWJlbC5pbm5lckhUTUwgPSBuZXdGaWVsZEluZm8uTGFiZWw7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LnNldEF0dHJpYnV0ZSgnbmFtZScsIG5ld0ZpZWxkSW5mby5LZXkpO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bmV3RmllbGRJbmZvLkNhbGxiYWNrKGV2ZW50KX0pO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5hcHBlbmRDaGlsZChkZWZhdWx0T3B0aW9uKTtcclxuXHRcdFx0bmV3RmllbGREaXYuYXBwZW5kQ2hpbGQobmV3RmllbGRMYWJlbCk7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKG5ld0ZpZWxkU2VsZWN0KTtcclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQobmV3RmllbGREaXYpO1xyXG5cclxuXHRcdFx0cmV0dXJuIG5ld0ZpZWxkU2VsZWN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2hvd3MgYXZhaWxibGUgdGlyZSBjb25maWd1cmF0aW9ucyB0byB0aGUgdXNlclxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRUaXJlQ29uZmlnKCl7XHJcblx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J3ZlaGljbGUvZ2V0dGlyZW9wdGlvbmRldGFpbHMnLCBkYXRhOntWZWhpY2xlQ29uZmlndXJhdGlvbnM6IFtiZXN0Q29uZmlndXJhdGlvbklkXX19KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRpZihyZXNwb25zZSAmJiByZXNwb25zZS5EZXRhaWxzLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRsZXQgdGlyZU9wdGlvbnMgPSB7T3B0aW9uczogcmVzcG9uc2UuRGV0YWlsc31cclxuXHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnModGlyZU9wdGlvbnMsIHRydWUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRidWlsZFVybCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEJ1aWxkIHRoZSB1cmwgdGhhdCB3aWxsIHRha2UgdXNlcnMgdG8gdGhlIHNob3djYXNlIHdpdGggdGhlaXIgY29uZmlndXJhdGlvbiBzZXR0aW5ncy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYnVpbGRVcmwoKXtcclxuXHRcdFx0bGV0IHVybCA9IFwiaHR0cDovL2FwcC5yaWRlc3R5bGVyLm5ldC9zaG93Y2FzZT9cIlxyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5hcGlLZXkpe1xyXG5cdFx0XHRcdHVybCArPSBvcHRpb25zLmFwaUtleSArIFwiI1wiO1xyXG5cdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRpZihiZXN0VGlyZUNvbmZpZ0lkKSB1cmwgKz0gXCImdG89XCIgKyBiZXN0VGlyZUNvbmZpZ0lkO1xyXG5cdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRnZXRSU0FwaUtleSgpLnRoZW4oZnVuY3Rpb24oYXBpS2V5KXsgXHJcblx0XHRcdFx0XHR1cmwgKz0gYXBpS2V5ICsgXCIjXCI7IFxyXG5cdFx0XHRcdFx0aWYoYmVzdENvbmZpZ3VyYXRpb25JZCkgdXJsICs9IFwidmM9XCIgKyBiZXN0Q29uZmlndXJhdGlvbklkO1xyXG5cdFx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSB1c2VycyBSaWRlU3R5bGVyIGFwaSBrZXlcclxuXHRcdCAqIEByZXR1cm5zIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJTQXBpS2V5KCl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOlwiQXBpQWNjZXNzS2V5L0dldFNoYXJlZEtleVwifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UuS2V5KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3cgdGhlIGJ1dHRvbiB0aGF0IHdpbGwgZGlyZWN0IHVzZXJzIHRvIHNob3djYXNlIGdpdmVuIGEgdXJsIHRvIHRoZSBzaG93Y2FzZS5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzaG93QnV0dG9uKHVybCl7XHJcblx0XHRcdGxldCBjb25maXJtQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvblRleHQpIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gb3B0aW9ucy5idXR0b25UZXh0O1xyXG5cdFx0XHRlbHNlIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gXCJTZWUgV2hlZWxzXCI7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvbkNsYXNzZXMpIG9wdGlvbnMuYnV0dG9uQ2xhc3Nlcy5tYXAoYnRuQ2xhc3MgPT4gY29uZmlybUJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ0bkNsYXNzKSk7IC8vaWYgdXNlciBoYXMgc3VwZXIgc2VjcmV0IHNwZWNpYWwgYnV0dG9uIGNsYXNzZXNcclxuXHJcblx0XHRcdGNvbmZpcm1CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQoY29uZmlybUJ1dHRvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZW1vdmUgZWxlbWVudCBmcm9tIHRoZSBkb20gZ2l2ZW4gdGhlIG5hbWUgYXR0ciBvZiB0aGUgZWxlbWVudC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZGVzdHJveUZpZWxkKGtleSl7XHJcblx0XHRcdGxldCBmaWVsZEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJyk7XHJcblxyXG5cdFx0XHRpZihrZXkgIT09IFwibWFrZVwiICYmIGtleSAhPT0gXCJtb2RlbFwiKXsgLy9pZiB0aGUga2V5IGlzIG5vdCBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IGdldCByaWQgb2YgdGhlIHNlbGVjdGlvbiBjb21wbGV0ZWx5XHJcblx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpKXtcclxuXHRcdFx0XHRcdHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKS5wYXJlbnRFbGVtZW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7IC8vaWYgdGhlIGtleSBpcyBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IHJlbW92ZSB0aGUgc2VsZWN0IG9wdGlvbnNcclxuXHRcdFx0XHRsZXQgZGlzYWJsZWRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuaW5uZXJIVE1MID0gJ1NlbGVjdCBhICcgKyBrZXk7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmFwcGVuZENoaWxkKGRpc2FibGVkRWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRpbml0aWFsaXplV2lkZ2V0KCk7XHJcblx0XHR9KVxyXG5cdH1cclxuXHR3aW5kb3cuVmVoaWNsZUNvbmZpZ3VyYXRpb24gPSBWZWhpY2xlQ29uZmlndXJhdGlvbjtcclxufSkoKTtcclxuIl19
