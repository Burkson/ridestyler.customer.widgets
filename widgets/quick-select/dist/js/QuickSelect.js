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
              tplEl = document.querySelector('#ridestyler-quick-select');
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

  window.VehicleConfiguration = VehicleConfiguration;
})();

},{"promise-polyfill":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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aEIsR0FBcUIsR0FBekMsQ0FBbkI7O0FBRUEsVUFBRyxHQUFHLEtBQUssTUFBUixJQUFrQixHQUFHLEtBQUssT0FBN0IsRUFBcUM7QUFBRTtBQUN0QyxZQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFnQixHQUFoQixHQUFxQixHQUF6QyxDQUFILEVBQWlEO0FBQ2hELFVBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsaUJBQWdCLEdBQWhCLEdBQXFCLEdBQXpDLEVBQThDLGFBQWhFO0FBQ0E7QUFDRCxPQUpELE1BSU87QUFBRTtBQUNSLFlBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQWpCO0FBQ0EsUUFBQSxVQUFVLENBQUMsWUFBWCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztBQUNBLFFBQUEsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEM7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFYLEdBQXVCLGNBQWMsR0FBckM7QUFDQSxRQUFBLFlBQVksQ0FBQyxTQUFiLEdBQXlCLEVBQXpCO0FBQ0EsUUFBQSxZQUFZLENBQUMsV0FBYixDQUF5QixVQUF6QjtBQUNBO0FBRUQ7O0FBRUQsSUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVU7QUFDdkQsTUFBQSxnQkFBZ0I7QUFDaEIsS0FGRDtBQUdBOztBQUVELEVBQUEsTUFBTSxDQUFDLG9CQUFQLEdBQThCLG9CQUE5QjtBQUNBLENBbFZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdGhpcyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gZmluYWxseUNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gIHJldHVybiB0aGlzLnRoZW4oXG4gICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn1cblxuLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbi8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxudmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuZnVuY3Rpb24gaXNBcnJheSh4KSB7XG4gIHJldHVybiBCb29sZWFuKHggJiYgdHlwZW9mIHgubGVuZ3RoICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbmZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5mdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLl9zdGF0ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IWJvb2xlYW59ICovXG4gIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtQcm9taXNlfHVuZGVmaW5lZH0gKi9cbiAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gIC8qKiBAdHlwZSB7IUFycmF5PCFGdW5jdGlvbj59ICovXG4gIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gIH1cbiAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZilcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgaWYgKFxuICAgICAgbmV3VmFsdWUgJiZcbiAgICAgICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICApIHtcbiAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3Qoc2VsZiwgZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHNlbGYuX3N0YXRlID0gMjtcbiAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgZmluYWxlKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgfVxuICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oXG4gICAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgZG9uZSA9IHRydWU7XG4gICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAvLyBAdHMtaWdub3JlXG4gIHZhciBwcm9tID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gIHJldHVybiBwcm9tO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA9IGZpbmFsbHlDb25zdHJ1Y3RvcjtcblxuUHJvbWlzZS5hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UuYWxsIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbChcbiAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UucmFjZSBhY2NlcHRzIGFuIGFycmF5JykpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZShhcnJbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG5Qcm9taXNlLl9pbW1lZGlhdGVGbiA9XG4gIC8vIEB0cy1pZ25vcmVcbiAgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICBmdW5jdGlvbihmbikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9KSB8fFxuICBmdW5jdGlvbihmbikge1xuICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgfTtcblxuUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCJpbXBvcnQgUHJvbWlzZSBmcm9tICdwcm9taXNlLXBvbHlmaWxsJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogVmVoaWNsZSBDb25maWd1cmF0aW9uOiBSZW5kZXIgdGhlIFZlaGljbGUgQ29uZmlndXJhdGlvbiB3aWRnZXQgd2l0aGluIGEgY29udGFpbmVyIGVsZW1lbnRcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gY29udGFpbmVySWQgLSBUaGUgaWQgb2YgdGhlIHdpZGdldCdzIHBhcmVudCBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBhcmd1bWVudHNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBWZWhpY2xlQ29uZmlndXJhdGlvbihjb250YWluZXJJZCwgb3B0aW9ucykge1xyXG5cdFx0bGV0IHZlaGljbGVNb2RlbCA9IHt9LFxyXG5cdFx0XHRjZG5VcmwgPSBvcHRpb25zLmRldk1vZGUgPyAnLi9zcmMvJyA6ICdodHRwczovL3N0YXRpYy5yaWRlc3R5bGVyLm5ldC93aWRnZXRzL3F1aWNrLXNlbGVjdC9lZGdlLycsXHJcblx0XHRcdHRwbFVybCA9IGNkblVybCArICdodG1sL3FzLnRwbCcsXHJcblx0XHRcdGNzc1VybCA9IGNkblVybCArICdjc3MvcXMubWluLmNzcycsXHJcblx0XHRcdHRwbEVsID0gbnVsbCxcclxuXHRcdFx0Y29udGFpbmVyID0gbnVsbCxcclxuXHRcdFx0YmVzdENvbmZpZ3VyYXRpb25JZCA9IG51bGwsXHJcblx0XHRcdGJlc3RUaXJlQ29uZmlnSWQgPSBudWxsO1xyXG5cclxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCBvdXIgdGVtcGxhdGUgYW5kIHN0eWxlcyBpZiBzcGVjaWZpZWQuIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gb3VyIHNlbGVjdHMuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVXaWRnZXQoKXtcclxuXHRcdFx0aW5pdGlhbGl6ZUNvbnRhaW5lcigpO1xyXG5cdFx0XHRsb2FkVHBsKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKG9wdGlvbnMuaW5jbHVkZVN0eWxlcykgbG9hZFN0eWxlcygpO1xyXG5cdFx0XHRcdGluaXRpYWxpemVVaSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSW5pdGlhbGl6ZSBvdXIgY29udGFpbmVyIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRhaW5lcigpe1xyXG5cdFx0XHRpZihjb250YWluZXJJZCkgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycgKyBjb250YWluZXJJZCk7XHJcblx0XHRcdGVsc2UgY29uc29sZS5lcnJvcigndGhlIHByb3ZpZGVkIGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIHRoZSBWZWhpY2xlIGNvbmZpZ3VyYXRpb24gdHBsXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRUcGwoKSB7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHJcblx0XHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0bGV0IGNvbXBsZXRlZCA9IDQ7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IGNvbXBsZXRlZCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHRcdFx0dHBsRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmlkZXN0eWxlci1xdWljay1zZWxlY3QnKTtcclxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignVmVoaWNsZSBjb25maWd1cmF0aW9uIHRlbXBsYXRlIGZhaWxlZCB0byBsb2FkLicpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0XHRcdHhoci5vcGVuKCdHRVQnLCB0cGxVcmwsIHRydWUpO1xyXG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgb3VyIHN1cGVyIHNwZWNpYWwgc2VjcmV0IHN0eWxlc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkU3R5bGVzKCkge1xyXG5cdFx0XHRsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuXHRcdFx0bGluay5ocmVmID0gY3NzVXJsO1xyXG5cdFx0XHRsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xyXG5cdFx0XHRsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemUgb3VyIGN1cnJlbnQgdmVoaWNsZSBzZWxlY3Rpb24gc2VsZWN0cyB3aXRoIGNoYW5nZSBldmVudCBsaXN0ZW5lcnNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVVpKCl7XHJcblx0XHRcdGxldCB5ZWFyRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT15ZWFyXScpLFxyXG5cdFx0XHRcdG1ha2VFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1ha2VdJyksXHJcblx0XHRcdFx0bW9kZWxFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1vZGVsXScpLFxyXG5cdFx0XHRcdGNvbmZpZ1RpdGxlID0gdHBsRWwucXVlcnlTZWxlY3RvcignI2NvbmZpZy1tZXNzYWdlJyk7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmNvbmZpZ1RpdGxlKSBjb25maWdUaXRsZS5pbm5lckhUTUwgPSBvcHRpb25zLmNvbmZpZ1RpdGxlO1xyXG5cclxuXHRcdFx0bG9hZE5leHRTdGVwKCk7XHJcblxyXG5cdFx0XHR5ZWFyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bWFrZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHRcdG1vZGVsRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG5leHQgdmVoaWNsZSBzZWxlY3Rpb24gc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtFdmVudH0gZSBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZE5leHRTdGVwKGUpe1xyXG5cdFx0XHRsZXQgY3VycmVudEVsID0gZSxcclxuXHRcdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gbnVsbCxcclxuXHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdCA9IHtTZWxlY3Rpb246W119LFxyXG5cdFx0XHRcdGxvYWRlciA9IG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjdXJyZW50RWwpe1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRFbC50YXJnZXQpIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC50YXJnZXQ7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZS1sb2FkZXInKSkgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nICYmIGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpKXtcclxuXHRcdFx0XHRcdGxvYWRlciA9IGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRcdFx0bG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBjdXJyZW50RWwuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcblxyXG5cdFx0XHRcdGlmKHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSkgeyAvLyBpZiB0aGUgc2VsZWN0aW9uIGFscmVhZHkgZXhpc3RzXHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0gPSBjdXJyZW50RWwudmFsdWU7XHJcblx0XHRcdFx0XHRyZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFNlbGVjdGlvbik7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gZWxzZSBhZGQgaXRcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTsgXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IobGV0IHByb3BlcnR5IGluIHZlaGljbGVNb2RlbCl7XHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW3Byb3BlcnR5XSAhPSBcIlwiKXtcclxuXHRcdFx0XHRcdGlmKHByb3BlcnR5ID09ICd0aXJlJykgYmVzdFRpcmVDb25maWdJZCA9IHZlaGljbGVNb2RlbFtwcm9wZXJ0eV07XHJcblx0XHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdC5TZWxlY3Rpb24ucHVzaChcclxuXHRcdFx0XHRcdFx0cHJvcGVydHkgKyBcIjpcIiArIHZlaGljbGVNb2RlbFtwcm9wZXJ0eV1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihjdXJyZW50U2VsZWN0aW9uICE9ICd0aXJlJyl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonVmVoaWNsZS9TZWxlY3QnLCBkYXRhOnZlaGljbGVTZWxlY3RSZXF1ZXN0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdGlmKCF2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldKXsgLy9pZiBrZXkgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIG91ciB2ZWhpY2xlIG1vZGVsLCBhZGQgaXQgYW5kIHBvcHVsYXRlIHRoZSBzZWxlY3QgZmllbGRcclxuXHRcdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0XHRwb3B1bGF0ZVZlaGljbGVPcHRpb25zKHJlc3BvbnNlLk1lbnUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuQmVzdENvbmZpZ3VyYXRpb24peyAvL2lmIHdlIGhhdmUgb3VyIEJlc3RDb25maWd1cmF0aW9uIHNldCB0aGVuIHdlIG5lZWQgdG8gZ2V0IG91ciB0aXJlIGNvbmZpZ1xyXG5cdFx0XHRcdFx0XHRcdGJlc3RDb25maWd1cmF0aW9uSWQgPSByZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRnZXRUaXJlQ29uZmlnKClcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGJ1aWxkVXJsKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHN0ZXBzIGFmdGVyIGN1cnJlbnQgc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGN1cnJlbnRTdGVwIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiByZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFN0ZXApe1xyXG5cdFx0XHRsZXQgY3VycmVudEluZGV4ID0gT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGN1cnJlbnRTdGVwKTtcclxuXHJcblx0XHRcdGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2ZWhpY2xlTW9kZWwpKSB7XHJcblx0XHRcdFx0aWYoT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGtleSkgPiBjdXJyZW50SW5kZXgpe1xyXG5cdFx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIGtleSArICddJykpe1xyXG5cdFx0XHRcdFx0XHRkZXN0cm95RmllbGQoa2V5KTtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHZlaGljbGVNb2RlbFtrZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpIHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUG9wdWxhdGUgYSBnaXZlbiBzZWxlY3QgZmllbGQgd2l0aCBvdXIgZ2l2ZW4gdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBwb3B1bGF0ZVZlaGljbGVPcHRpb25zKG5ld0ZpZWxkSW5mbywgaXNUaXJlT3B0aW9ucyl7XHJcblx0XHRcdGxldCBzZWxlY3RFbGVtZW50ID0gbnVsbCxcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7fTtcclxuXHJcblx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRoZXNlIGFyZSB0aXJlIG9wdGlvbnMgd2Uga25vdyB3ZSBuZWVkIHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkIHdpdGggaW5mbyBub3QgZnJvbSB0aGUgcGFzc2VkIGRhdGFcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7S2V5OiAndGlyZScsIExhYmVsOiAnVGlyZSBPcHRpb24nLCBDYWxsYmFjazogbG9hZE5leHRTdGVwfTtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9IGVsc2UgaWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIG5ld0ZpZWxkSW5mby5LZXkgKyAnXScpKXsgLy9lbHNlIGlmIHRoZSBmaWVsZCBhbHJlYWR5IGV4aXN0cyB3ZSB3YW50IHRvIHVzZSBpdFxyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJyk7XHJcblx0XHRcdH0gZWxzZSB7IC8vZWxzZSB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkXHJcblx0XHRcdFx0ZmllbGRJbmZvLkxhYmVsID0gbmV3RmllbGRJbmZvLlRpdGxlO1xyXG5cdFx0XHRcdGZpZWxkSW5mby5LZXkgPSBuZXdGaWVsZEluZm8uS2V5O1xyXG5cdFx0XHRcdGZpZWxkSW5mby5DYWxsYmFjayA9IGxvYWROZXh0U3RlcDtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuXHJcblx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA+IDApeyAvL1dlIHdhbnQgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBvcHRpb25zIGZpcnN0XHJcblx0XHRcdFx0bmV3RmllbGRJbmZvLk9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihvcHRpb24pe1xyXG5cdFx0XHRcdFx0bGV0IG9wdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcblx0XHRcdFx0XHRpZihpc1RpcmVPcHRpb25zKXsgLy9pZiB0aXJlIG9wdGlvbiB3ZSBrbm93IHRoZSBkYXRhIGlzIGRpZmZlcmVudFxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5UaXJlT3B0aW9uSUQ7XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLmlubmVySFRNTCA9IG9wdGlvbi5Gcm9udC5EZXNjcmlwdGlvbjtcclxuXHRcdFx0XHRcdFx0c2VsZWN0RWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIG9wdGlvbiBkYXRhIGlzIGFsd2F5cyB0aGUgc2FtZVxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkxhYmVsO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA9PSAxKSBvcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgdHJ1ZSk7IC8vY2hlY2sgaWYgdGhlcmUgaXMgb25seSBvbmUgb3B0aW9uLCBpZiBzbyBzZWxlY3QgaXRcclxuXHRcdFx0XHR9KTtcdFxyXG5cdFx0XHR9IFxyXG5cclxuXHRcdFx0c2VsZWN0RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlLWxvYWRlcicpO1x0Ly9yZW1vdmUgbG9hZGVyIG9uIHNlbGVjdCBlbGVtZW50XHJcblx0XHRcdGlmKHNlbGVjdEVsZW1lbnQudmFsdWUuaW5kZXhPZignU2VsZWN0JykgPT0gLTEpIGxvYWROZXh0U3RlcChzZWxlY3RFbGVtZW50KTsgLy9pZiB0aGVyZSB3YXMgb25seSBvbmUgb3B0aW9uIGl0J3Mgc2VsZWN0ZWQsIG1vdmUgdG8gbmV4dCBzdGVwLlxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2VuZXJhdGUgYSBuZXcgZmllbGQgZ2l2ZW4gdGhlIG5hbWUgYW5kIG5ldyB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZW5lcmF0ZU5ld0ZpZWxkKG5ld0ZpZWxkSW5mbyl7XHJcblx0XHRcdGxldCBuZXdGaWVsZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRcdG5ld0ZpZWxkU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0JyksXHJcblx0XHRcdFx0bmV3RmllbGRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyksXHJcblx0XHRcdFx0ZGVmYXVsdE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpLFxyXG5cdFx0XHRcdHNlbGVjdExvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdC1sb2FkZXInKTtcclxuXHRcdFx0bmV3RmllbGREaXYuY2xhc3NMaXN0LmFkZCgnY29uZmlnLXNlbGVjdCcpO1xyXG5cdFx0XHRkZWZhdWx0T3B0aW9uLmlubmVySFRNTCA9IFwiU2VsZWN0IGEgXCIgKyBuZXdGaWVsZEluZm8uS2V5O1xyXG5cdFx0XHRuZXdGaWVsZExhYmVsLmlubmVySFRNTCA9IG5ld0ZpZWxkSW5mby5MYWJlbDtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgbmV3RmllbGRJbmZvLktleSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtuZXdGaWVsZEluZm8uQ2FsbGJhY2soZXZlbnQpfSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFwcGVuZENoaWxkKGRlZmF1bHRPcHRpb24pO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChuZXdGaWVsZExhYmVsKTtcclxuXHRcdFx0bmV3RmllbGREaXYuYXBwZW5kQ2hpbGQobmV3RmllbGRTZWxlY3QpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RMb2FkZXIpO1xyXG5cdFx0XHR0cGxFbC5hcHBlbmRDaGlsZChuZXdGaWVsZERpdik7XHJcblxyXG5cdFx0XHRyZXR1cm4gbmV3RmllbGRTZWxlY3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93cyBhdmFpbGJsZSB0aXJlIGNvbmZpZ3VyYXRpb25zIHRvIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFRpcmVDb25maWcoKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J3ZlaGljbGUvZ2V0dGlyZW9wdGlvbmRldGFpbHMnLCBkYXRhOntWZWhpY2xlQ29uZmlndXJhdGlvbnM6IFtiZXN0Q29uZmlndXJhdGlvbklkXX19KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlICYmIHJlc3BvbnNlLkRldGFpbHMubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0dmVoaWNsZU1vZGVsLnRpcmUgPSAnJztcclxuXHRcdFx0XHRcdFx0bGV0IHRpcmVPcHRpb25zID0ge09wdGlvbnM6IHJlc3BvbnNlLkRldGFpbHN9XHJcblx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnModGlyZU9wdGlvbnMsIHRydWUpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBCdWlsZCB0aGUgdXJsIHRoYXQgd2lsbCB0YWtlIHVzZXJzIHRvIHRoZSBzaG93Y2FzZSB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGJ1aWxkVXJsKCl7XHJcblx0XHRcdGxldCB1cmwgPSBcImh0dHA6Ly9hcHAucmlkZXN0eWxlci5uZXQvc2hvd2Nhc2U/XCJcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuYXBpS2V5KXtcclxuXHRcdFx0XHR1cmwgKz0gb3B0aW9ucy5hcGlLZXkgKyBcIiNcIjtcclxuXHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRzaG93QnV0dG9uKHVybCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdFx0Z2V0UlNBcGlLZXkoKS50aGVuKGZ1bmN0aW9uKGFwaUtleSl7IFxyXG5cdFx0XHRcdFx0XHR1cmwgKz0gYXBpS2V5ICsgXCIjXCI7IFxyXG5cdFx0XHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0XHRcdGlmKGJlc3RUaXJlQ29uZmlnSWQpIHVybCArPSBcIiZ0bz1cIiArIGJlc3RUaXJlQ29uZmlnSWQ7XHJcblx0XHRcdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgdXNlcnMgUmlkZVN0eWxlciBhcGkga2V5XHJcblx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRSU0FwaUtleSgpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjpcIkFwaUFjY2Vzc0tleS9HZXRTaGFyZWRLZXlcIn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlLktleSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93IHRoZSBidXR0b24gdGhhdCB3aWxsIGRpcmVjdCB1c2VycyB0byBzaG93Y2FzZSBnaXZlbiBhIHVybCB0byB0aGUgc2hvd2Nhc2UuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2hvd0J1dHRvbih1cmwpe1xyXG5cdFx0XHRsZXQgY29uZmlybUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25UZXh0KSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IG9wdGlvbnMuYnV0dG9uVGV4dDtcclxuXHRcdFx0ZWxzZSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IFwiU2VlIFdoZWVsc1wiO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25DbGFzc2VzKSBvcHRpb25zLmJ1dHRvbkNsYXNzZXMubWFwKGJ0bkNsYXNzID0+IGNvbmZpcm1CdXR0b24uY2xhc3NMaXN0LmFkZChidG5DbGFzcykpOyAvL2lmIHVzZXIgaGFzIHN1cGVyIHNlY3JldCBzcGVjaWFsIGJ1dHRvbiBjbGFzc2VzXHJcblxyXG5cdFx0XHRjb25maXJtQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR3aW5kb3cub3Blbih1cmwpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKGNvbmZpcm1CdXR0b24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVtb3ZlIGVsZW1lbnQgZnJvbSB0aGUgZG9tIGdpdmVuIHRoZSBuYW1lIGF0dHIgb2YgdGhlIGVsZW1lbnQuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGRlc3Ryb3lGaWVsZChrZXkpe1xyXG5cdFx0XHRsZXQgZmllbGRFbGVtZW50ID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpO1xyXG5cclxuXHRcdFx0aWYoa2V5ICE9PSBcIm1ha2VcIiAmJiBrZXkgIT09IFwibW9kZWxcIil7IC8vaWYgdGhlIGtleSBpcyBub3QgbWFrZSBvciBtb2RlbCwgd2UganVzdCBnZXQgcmlkIG9mIHRoZSBzZWxlY3Rpb24gY29tcGxldGVseVxyXG5cdFx0XHRcdGlmKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKSl7XHJcblx0XHRcdFx0XHR0cGxFbC5yZW1vdmVDaGlsZCh0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJykucGFyZW50RWxlbWVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgeyAvL2lmIHRoZSBrZXkgaXMgbWFrZSBvciBtb2RlbCwgd2UganVzdCByZW1vdmUgdGhlIHNlbGVjdCBvcHRpb25zXHJcblx0XHRcdFx0bGV0IGRpc2FibGVkRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLmlubmVySFRNTCA9ICdTZWxlY3QgYSAnICsga2V5O1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5hcHBlbmRDaGlsZChkaXNhYmxlZEVsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0aW5pdGlhbGl6ZVdpZGdldCgpO1xyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHdpbmRvdy5WZWhpY2xlQ29uZmlndXJhdGlvbiA9IFZlaGljbGVDb25maWd1cmF0aW9uO1xyXG59KSgpO1xyXG4iXX0=
