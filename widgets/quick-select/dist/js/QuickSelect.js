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
      var url = options.url;
      if (url.indexOf('?') == -1) url += '?';else url += '&';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QixhQUFsQjtBQUNBO0FBRUQ7Ozs7OztBQUlBLGFBQVMsWUFBVCxDQUFzQixHQUF0QixFQUEwQjtBQUN6QixVQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBZ0IsR0FBaEIsR0FBcUIsR0FBekMsQ0FBbkI7O0FBRUEsVUFBRyxHQUFHLEtBQUssTUFBUixJQUFrQixHQUFHLEtBQUssT0FBN0IsRUFBcUM7QUFBRTtBQUN0QyxZQUFHLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFnQixHQUFoQixHQUFxQixHQUF6QyxDQUFILEVBQWlEO0FBQ2hELFVBQUEsS0FBSyxDQUFDLFdBQU4sQ0FBa0IsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsaUJBQWdCLEdBQWhCLEdBQXFCLEdBQXpDLEVBQThDLGFBQWhFO0FBQ0E7QUFDRCxPQUpELE1BSU87QUFBRTtBQUNSLFlBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQWpCO0FBQ0EsUUFBQSxVQUFVLENBQUMsWUFBWCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztBQUNBLFFBQUEsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEM7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFYLEdBQXVCLGNBQWMsR0FBckM7QUFDQSxRQUFBLFlBQVksQ0FBQyxTQUFiLEdBQXlCLEVBQXpCO0FBQ0EsUUFBQSxZQUFZLENBQUMsV0FBYixDQUF5QixVQUF6QjtBQUNBO0FBRUQ7O0FBRUQsSUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFlBQVU7QUFDdkQsTUFBQSxnQkFBZ0I7QUFDaEIsS0FGRDtBQUdBOztBQUVELEVBQUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsV0FBckI7QUFDQSxDQXJWRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQHRoaXMge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIGZpbmFsbHlDb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gdGhpcy50aGVuKFxuICAgIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlc29sdmUoY2FsbGJhY2soKSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59XG5cbi8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4vLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbnZhciBzZXRUaW1lb3V0RnVuYyA9IHNldFRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGlzQXJyYXkoeCkge1xuICByZXR1cm4gQm9vbGVhbih4ICYmIHR5cGVvZiB4Lmxlbmd0aCAhPT0gJ3VuZGVmaW5lZCcpO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxuLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5mdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJvbWlzZSkpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3Jyk7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cbiAgdGhpcy5fc3RhdGUgPSAwO1xuICAvKiogQHR5cGUgeyFib29sZWFufSAqL1xuICB0aGlzLl9oYW5kbGVkID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7UHJvbWlzZXx1bmRlZmluZWR9ICovXG4gIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICAvKiogQHR5cGUgeyFBcnJheTwhRnVuY3Rpb24+fSAqL1xuICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICBkb1Jlc29sdmUoZm4sIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgd2hpbGUgKHNlbGYuX3N0YXRlID09PSAzKSB7XG4gICAgc2VsZiA9IHNlbGYuX3ZhbHVlO1xuICB9XG4gIGlmIChzZWxmLl9zdGF0ZSA9PT0gMCkge1xuICAgIHNlbGYuX2RlZmVycmVkcy5wdXNoKGRlZmVycmVkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgc2VsZi5faGFuZGxlZCA9IHRydWU7XG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgIGlmIChjYiA9PT0gbnVsbCkge1xuICAgICAgKHNlbGYuX3N0YXRlID09PSAxID8gcmVzb2x2ZSA6IHJlamVjdCkoZGVmZXJyZWQucHJvbWlzZSwgc2VsZi5fdmFsdWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmV0O1xuICAgIHRyeSB7XG4gICAgICByZXQgPSBjYihzZWxmLl92YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHRyeSB7XG4gICAgLy8gUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLicpO1xuICAgIGlmIChcbiAgICAgIG5ld1ZhbHVlICYmXG4gICAgICAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgKSB7XG4gICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICBpZiAobmV3VmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHNlbGYuX3N0YXRlID0gMztcbiAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgZmluYWxlKHNlbGYpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRvUmVzb2x2ZShiaW5kKHRoZW4sIG5ld1ZhbHVlKSwgc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5fc3RhdGUgPSAxO1xuICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZmluYWxlKHNlbGYpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHNlbGYsIGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICBzZWxmLl9zdGF0ZSA9IDI7XG4gIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gIGZpbmFsZShzZWxmKTtcbn1cblxuZnVuY3Rpb24gZmluYWxlKHNlbGYpIHtcbiAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghc2VsZi5faGFuZGxlZCkge1xuICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsZi5fZGVmZXJyZWRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG4gIH1cbiAgc2VsZi5fZGVmZXJyZWRzID0gbnVsbDtcbn1cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICB0aGlzLm9uRnVsZmlsbGVkID0gdHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiBudWxsO1xuICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xufVxuXG4vKipcbiAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gKiBvbkZ1bGZpbGxlZCBhbmQgb25SZWplY3RlZCBhcmUgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gKi9cbmZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuICB2YXIgZG9uZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGZuKFxuICAgICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9XG4gICAgKTtcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgIGRvbmUgPSB0cnVlO1xuICAgIHJlamVjdChzZWxmLCBleCk7XG4gIH1cbn1cblxuUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbihvblJlamVjdGVkKSB7XG4gIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgLy8gQHRzLWlnbm9yZVxuICB2YXIgcHJvbSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGhhbmRsZSh0aGlzLCBuZXcgSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbSkpO1xuICByZXR1cm4gcHJvbTtcbn07XG5cblByb21pc2UucHJvdG90eXBlWydmaW5hbGx5J10gPSBmaW5hbGx5Q29uc3RydWN0b3I7XG5cblByb21pc2UuYWxsID0gZnVuY3Rpb24oYXJyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdQcm9taXNlLmFsbCBhY2NlcHRzIGFuIGFycmF5JykpO1xuICAgIH1cblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKTtcbiAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGg7XG5cbiAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW47XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwoXG4gICAgICAgICAgICAgIHZhbCxcbiAgICAgICAgICAgICAgZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAgICAgcmVzKGksIHZhbCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXJnc1tpXSA9IHZhbDtcbiAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlcyhpLCBhcmdzW2ldKTtcbiAgICB9XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IFByb21pc2UpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9KTtcbn07XG5cblByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlamVjdCh2YWx1ZSk7XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24oYXJyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoIWlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdQcm9taXNlLnJhY2UgYWNjZXB0cyBhbiBhcnJheScpKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBQcm9taXNlLnJlc29sdmUoYXJyW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIFVzZSBwb2x5ZmlsbCBmb3Igc2V0SW1tZWRpYXRlIGZvciBwZXJmb3JtYW5jZSBnYWluc1xuUHJvbWlzZS5faW1tZWRpYXRlRm4gPVxuICAvLyBAdHMtaWdub3JlXG4gICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmXG4gICAgZnVuY3Rpb24oZm4pIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHNldEltbWVkaWF0ZShmbik7XG4gICAgfSkgfHxcbiAgZnVuY3Rpb24oZm4pIHtcbiAgICBzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG4gIH07XG5cblByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3VuaGFuZGxlZFJlamVjdGlvbkZuKGVycikge1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcbiAgICBjb25zb2xlLndhcm4oJ1Bvc3NpYmxlIFVuaGFuZGxlZCBQcm9taXNlIFJlamVjdGlvbjonLCBlcnIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuIiwidmFyIG5leHRUaWNrID0gcmVxdWlyZSgncHJvY2Vzcy9icm93c2VyLmpzJykubmV4dFRpY2s7XG52YXIgYXBwbHkgPSBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7XG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaW1tZWRpYXRlSWRzID0ge307XG52YXIgbmV4dEltbWVkaWF0ZUlkID0gMDtcblxuLy8gRE9NIEFQSXMsIGZvciBjb21wbGV0ZW5lc3NcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldFRpbWVvdXQsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJUaW1lb3V0KTtcbn07XG5leHBvcnRzLnNldEludGVydmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgVGltZW91dChhcHBseS5jYWxsKHNldEludGVydmFsLCB3aW5kb3csIGFyZ3VtZW50cyksIGNsZWFySW50ZXJ2YWwpO1xufTtcbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID1cbmV4cG9ydHMuY2xlYXJJbnRlcnZhbCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHsgdGltZW91dC5jbG9zZSgpOyB9O1xuXG5mdW5jdGlvbiBUaW1lb3V0KGlkLCBjbGVhckZuKSB7XG4gIHRoaXMuX2lkID0gaWQ7XG4gIHRoaXMuX2NsZWFyRm4gPSBjbGVhckZuO1xufVxuVGltZW91dC5wcm90b3R5cGUudW5yZWYgPSBUaW1lb3V0LnByb3RvdHlwZS5yZWYgPSBmdW5jdGlvbigpIHt9O1xuVGltZW91dC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fY2xlYXJGbi5jYWxsKHdpbmRvdywgdGhpcy5faWQpO1xufTtcblxuLy8gRG9lcyBub3Qgc3RhcnQgdGhlIHRpbWUsIGp1c3Qgc2V0cyB1cCB0aGUgbWVtYmVycyBuZWVkZWQuXG5leHBvcnRzLmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0sIG1zZWNzKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSBtc2Vjcztcbn07XG5cbmV4cG9ydHMudW5lbnJvbGwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcbiAgaXRlbS5faWRsZVRpbWVvdXQgPSAtMTtcbn07XG5cbmV4cG9ydHMuX3VucmVmQWN0aXZlID0gZXhwb3J0cy5hY3RpdmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGNsZWFyVGltZW91dChpdGVtLl9pZGxlVGltZW91dElkKTtcblxuICB2YXIgbXNlY3MgPSBpdGVtLl9pZGxlVGltZW91dDtcbiAgaWYgKG1zZWNzID49IDApIHtcbiAgICBpdGVtLl9pZGxlVGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICBpZiAoaXRlbS5fb25UaW1lb3V0KVxuICAgICAgICBpdGVtLl9vblRpbWVvdXQoKTtcbiAgICB9LCBtc2Vjcyk7XG4gIH1cbn07XG5cbi8vIFRoYXQncyBub3QgaG93IG5vZGUuanMgaW1wbGVtZW50cyBpdCBidXQgdGhlIGV4cG9zZWQgYXBpIGlzIHRoZSBzYW1lLlxuZXhwb3J0cy5zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRJbW1lZGlhdGUgOiBmdW5jdGlvbihmbikge1xuICB2YXIgaWQgPSBuZXh0SW1tZWRpYXRlSWQrKztcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGZhbHNlIDogc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gIGltbWVkaWF0ZUlkc1tpZF0gPSB0cnVlO1xuXG4gIG5leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKSB7XG4gICAgaWYgKGltbWVkaWF0ZUlkc1tpZF0pIHtcbiAgICAgIC8vIGZuLmNhbGwoKSBpcyBmYXN0ZXIgc28gd2Ugb3B0aW1pemUgZm9yIHRoZSBjb21tb24gdXNlLWNhc2VcbiAgICAgIC8vIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vY2FsbC1hcHBseS1zZWd1XG4gICAgICBpZiAoYXJncykge1xuICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCk7XG4gICAgICB9XG4gICAgICAvLyBQcmV2ZW50IGlkcyBmcm9tIGxlYWtpbmdcbiAgICAgIGV4cG9ydHMuY2xlYXJJbW1lZGlhdGUoaWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuZXhwb3J0cy5jbGVhckltbWVkaWF0ZSA9IHR5cGVvZiBjbGVhckltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xlYXJJbW1lZGlhdGUgOiBmdW5jdGlvbihpZCkge1xuICBkZWxldGUgaW1tZWRpYXRlSWRzW2lkXTtcbn07IiwiaW1wb3J0IFByb21pc2UgZnJvbSAncHJvbWlzZS1wb2x5ZmlsbCc7XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cdC8qKlxyXG5cdCAqIFF1aWNrIFNlbGVjdDogUmVuZGVyIHRoZSBRdWljayBTZWxjdCB3aWRnZXQgd2l0aGluIGEgY29udGFpbmVyIGVsZW1lbnRcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gY29udGFpbmVySWQgLSBUaGUgaWQgb2YgdGhlIHdpZGdldCdzIHBhcmVudCBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPcHRpb25hbCBhcmd1bWVudHNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBRdWlja1NlbGVjdChjb250YWluZXJJZCwgb3B0aW9ucykge1xyXG5cdFx0bGV0IHZlaGljbGVNb2RlbCA9IHt9LFxyXG5cdFx0XHRjZG5VcmwgPSBvcHRpb25zLmRldk1vZGUgPyAnLi9zcmMvJyA6ICdodHRwczovL3N0YXRpYy5yaWRlc3R5bGVyLm5ldC93aWRnZXRzL3F1aWNrLXNlbGVjdC9lZGdlLycsXHJcblx0XHRcdHRwbFVybCA9IGNkblVybCArICdodG1sL3FzLnRwbCcsXHJcblx0XHRcdGNzc1VybCA9IGNkblVybCArICdjc3MvcXMubWluLmNzcycsXHJcblx0XHRcdHRwbEVsID0gbnVsbCxcclxuXHRcdFx0Y29udGFpbmVyID0gbnVsbCxcclxuXHRcdFx0YmVzdENvbmZpZ3VyYXRpb25JZCA9IG51bGwsXHJcblx0XHRcdGJlc3RUaXJlQ29uZmlnSWQgPSBudWxsO1xyXG5cclxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCBvdXIgdGVtcGxhdGUgYW5kIHN0eWxlcyBpZiBzcGVjaWZpZWQuIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gb3VyIHNlbGVjdHMuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVXaWRnZXQoKXtcclxuXHRcdFx0aW5pdGlhbGl6ZUNvbnRhaW5lcigpO1xyXG5cdFx0XHRsb2FkVHBsKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKG9wdGlvbnMuaW5jbHVkZVN0eWxlcykgbG9hZFN0eWxlcygpO1xyXG5cdFx0XHRcdGluaXRpYWxpemVVaSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSW5pdGlhbGl6ZSBvdXIgY29udGFpbmVyIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRhaW5lcigpe1xyXG5cdFx0XHRpZihjb250YWluZXJJZCkgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycgKyBjb250YWluZXJJZCk7XHJcblx0XHRcdGVsc2UgY29uc29sZS5lcnJvcigndGhlIHByb3ZpZGVkIGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIHRoZSBRdWljayBTZWxlY3QgdHBsXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRUcGwoKSB7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHJcblx0XHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0bGV0IGNvbXBsZXRlZCA9IDQ7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IGNvbXBsZXRlZCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHRcdFx0dHBsRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmlkZXN0eWxlci1xdWljay1zZWxlY3QnKTtcclxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignUXVpY2sgU2VsZWN0IHRlbXBsYXRlIGZhaWxlZCB0byBsb2FkLicpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0XHRcdHhoci5vcGVuKCdHRVQnLCB0cGxVcmwsIHRydWUpO1xyXG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgb3VyIHN1cGVyIHNwZWNpYWwgc2VjcmV0IHN0eWxlc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkU3R5bGVzKCkge1xyXG5cdFx0XHRsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuXHRcdFx0bGluay5ocmVmID0gY3NzVXJsO1xyXG5cdFx0XHRsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xyXG5cdFx0XHRsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemUgb3VyIGN1cnJlbnQgdmVoaWNsZSBzZWxlY3Rpb24gc2VsZWN0cyB3aXRoIGNoYW5nZSBldmVudCBsaXN0ZW5lcnNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVVpKCl7XHJcblx0XHRcdGxldCB5ZWFyRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT15ZWFyXScpLFxyXG5cdFx0XHRcdG1ha2VFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1ha2VdJyksXHJcblx0XHRcdFx0bW9kZWxFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1vZGVsXScpLFxyXG5cdFx0XHRcdGNvbmZpZ1RpdGxlID0gdHBsRWwucXVlcnlTZWxlY3RvcignI2NvbmZpZy1tZXNzYWdlJyk7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmNvbmZpZ1RpdGxlKSBjb25maWdUaXRsZS5pbm5lckhUTUwgPSBvcHRpb25zLmNvbmZpZ1RpdGxlO1xyXG5cclxuXHRcdFx0bG9hZE5leHRTdGVwKCk7XHJcblxyXG5cdFx0XHR5ZWFyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bWFrZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHRcdG1vZGVsRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG5leHQgdmVoaWNsZSBzZWxlY3Rpb24gc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtFdmVudH0gZSBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZE5leHRTdGVwKGUpe1xyXG5cdFx0XHRsZXQgY3VycmVudEVsID0gZSxcclxuXHRcdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gbnVsbCxcclxuXHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdCA9IHtTZWxlY3Rpb246W119LFxyXG5cdFx0XHRcdGxvYWRlciA9IG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjdXJyZW50RWwpe1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRFbC50YXJnZXQpIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC50YXJnZXQ7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZS1sb2FkZXInKSkgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nICYmIGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpKXtcclxuXHRcdFx0XHRcdGxvYWRlciA9IGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRcdFx0bG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBjdXJyZW50RWwuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcblxyXG5cdFx0XHRcdGlmKHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSkgeyAvLyBpZiB0aGUgc2VsZWN0aW9uIGFscmVhZHkgZXhpc3RzXHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0gPSBjdXJyZW50RWwudmFsdWU7XHJcblx0XHRcdFx0XHRyZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFNlbGVjdGlvbik7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gZWxzZSBhZGQgaXRcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTsgXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IobGV0IHByb3BlcnR5IGluIHZlaGljbGVNb2RlbCl7XHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW3Byb3BlcnR5XSAhPSBcIlwiKXtcclxuXHRcdFx0XHRcdGlmKHByb3BlcnR5ID09ICd0aXJlJykgYmVzdFRpcmVDb25maWdJZCA9IHZlaGljbGVNb2RlbFtwcm9wZXJ0eV07XHJcblx0XHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdC5TZWxlY3Rpb24ucHVzaChcclxuXHRcdFx0XHRcdFx0cHJvcGVydHkgKyBcIjpcIiArIHZlaGljbGVNb2RlbFtwcm9wZXJ0eV1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihjdXJyZW50U2VsZWN0aW9uICE9ICd0aXJlJyl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonVmVoaWNsZS9TZWxlY3QnLCBkYXRhOnZlaGljbGVTZWxlY3RSZXF1ZXN0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdGlmKCF2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldKXsgLy9pZiBrZXkgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIG91ciB2ZWhpY2xlIG1vZGVsLCBhZGQgaXQgYW5kIHBvcHVsYXRlIHRoZSBzZWxlY3QgZmllbGRcclxuXHRcdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0XHRwb3B1bGF0ZVZlaGljbGVPcHRpb25zKHJlc3BvbnNlLk1lbnUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuQmVzdENvbmZpZ3VyYXRpb24peyAvL2lmIHdlIGhhdmUgb3VyIEJlc3RDb25maWd1cmF0aW9uIHNldCB0aGVuIHdlIG5lZWQgdG8gZ2V0IG91ciB0aXJlIGNvbmZpZ1xyXG5cdFx0XHRcdFx0XHRcdGJlc3RDb25maWd1cmF0aW9uSWQgPSByZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRnZXRUaXJlQ29uZmlnKClcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGJ1aWxkVXJsKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHN0ZXBzIGFmdGVyIGN1cnJlbnQgc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGN1cnJlbnRTdGVwIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiByZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFN0ZXApe1xyXG5cdFx0XHRsZXQgY3VycmVudEluZGV4ID0gT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGN1cnJlbnRTdGVwKTtcclxuXHJcblx0XHRcdGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2ZWhpY2xlTW9kZWwpKSB7XHJcblx0XHRcdFx0aWYoT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGtleSkgPiBjdXJyZW50SW5kZXgpe1xyXG5cdFx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIGtleSArICddJykpe1xyXG5cdFx0XHRcdFx0XHRkZXN0cm95RmllbGQoa2V5KTtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHZlaGljbGVNb2RlbFtrZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpIHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUG9wdWxhdGUgYSBnaXZlbiBzZWxlY3QgZmllbGQgd2l0aCBvdXIgZ2l2ZW4gdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBwb3B1bGF0ZVZlaGljbGVPcHRpb25zKG5ld0ZpZWxkSW5mbywgaXNUaXJlT3B0aW9ucyl7XHJcblx0XHRcdGxldCBzZWxlY3RFbGVtZW50ID0gbnVsbCxcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7fTtcclxuXHJcblx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRoZXNlIGFyZSB0aXJlIG9wdGlvbnMgd2Uga25vdyB3ZSBuZWVkIHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkIHdpdGggaW5mbyBub3QgZnJvbSB0aGUgcGFzc2VkIGRhdGFcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7S2V5OiAndGlyZScsIExhYmVsOiAnVGlyZSBPcHRpb24nLCBDYWxsYmFjazogbG9hZE5leHRTdGVwfTtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9IGVsc2UgaWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIG5ld0ZpZWxkSW5mby5LZXkgKyAnXScpKXsgLy9lbHNlIGlmIHRoZSBmaWVsZCBhbHJlYWR5IGV4aXN0cyB3ZSB3YW50IHRvIHVzZSBpdFxyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJyk7XHJcblx0XHRcdH0gZWxzZSB7IC8vZWxzZSB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkXHJcblx0XHRcdFx0ZmllbGRJbmZvLkxhYmVsID0gbmV3RmllbGRJbmZvLlRpdGxlO1xyXG5cdFx0XHRcdGZpZWxkSW5mby5LZXkgPSBuZXdGaWVsZEluZm8uS2V5O1xyXG5cdFx0XHRcdGZpZWxkSW5mby5DYWxsYmFjayA9IGxvYWROZXh0U3RlcDtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuXHJcblx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA+IDApeyAvL1dlIHdhbnQgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBvcHRpb25zIGZpcnN0XHJcblx0XHRcdFx0bmV3RmllbGRJbmZvLk9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihvcHRpb24pe1xyXG5cdFx0XHRcdFx0bGV0IG9wdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcblx0XHRcdFx0XHRpZihpc1RpcmVPcHRpb25zKXsgLy9pZiB0aXJlIG9wdGlvbiB3ZSBrbm93IHRoZSBkYXRhIGlzIGRpZmZlcmVudFxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5UaXJlT3B0aW9uSUQ7XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLmlubmVySFRNTCA9IG9wdGlvbi5Gcm9udC5EZXNjcmlwdGlvbjtcclxuXHRcdFx0XHRcdFx0c2VsZWN0RWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIG9wdGlvbiBkYXRhIGlzIGFsd2F5cyB0aGUgc2FtZVxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkxhYmVsO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA9PSAxKSBvcHRpb25FbC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgdHJ1ZSk7IC8vY2hlY2sgaWYgdGhlcmUgaXMgb25seSBvbmUgb3B0aW9uLCBpZiBzbyBzZWxlY3QgaXRcclxuXHRcdFx0XHR9KTtcdFxyXG5cdFx0XHR9IFxyXG5cclxuXHRcdFx0c2VsZWN0RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlLWxvYWRlcicpO1x0Ly9yZW1vdmUgbG9hZGVyIG9uIHNlbGVjdCBlbGVtZW50XHJcblx0XHRcdGlmKHNlbGVjdEVsZW1lbnQudmFsdWUuaW5kZXhPZignU2VsZWN0JykgPT0gLTEpIGxvYWROZXh0U3RlcChzZWxlY3RFbGVtZW50KTsgLy9pZiB0aGVyZSB3YXMgb25seSBvbmUgb3B0aW9uIGl0J3Mgc2VsZWN0ZWQsIG1vdmUgdG8gbmV4dCBzdGVwLlxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2VuZXJhdGUgYSBuZXcgZmllbGQgZ2l2ZW4gdGhlIG5hbWUgYW5kIG5ldyB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZW5lcmF0ZU5ld0ZpZWxkKG5ld0ZpZWxkSW5mbyl7XHJcblx0XHRcdGxldCBuZXdGaWVsZERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRcdG5ld0ZpZWxkU2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0JyksXHJcblx0XHRcdFx0bmV3RmllbGRMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyksXHJcblx0XHRcdFx0ZGVmYXVsdE9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpLFxyXG5cdFx0XHRcdHNlbGVjdExvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdC1sb2FkZXInKTtcclxuXHRcdFx0bmV3RmllbGREaXYuY2xhc3NMaXN0LmFkZCgnY29uZmlnLXNlbGVjdCcpO1xyXG5cdFx0XHRkZWZhdWx0T3B0aW9uLmlubmVySFRNTCA9IFwiU2VsZWN0IGEgXCIgKyBuZXdGaWVsZEluZm8uS2V5O1xyXG5cdFx0XHRuZXdGaWVsZExhYmVsLmlubmVySFRNTCA9IG5ld0ZpZWxkSW5mby5MYWJlbDtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgbmV3RmllbGRJbmZvLktleSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtuZXdGaWVsZEluZm8uQ2FsbGJhY2soZXZlbnQpfSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFwcGVuZENoaWxkKGRlZmF1bHRPcHRpb24pO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChuZXdGaWVsZExhYmVsKTtcclxuXHRcdFx0bmV3RmllbGREaXYuYXBwZW5kQ2hpbGQobmV3RmllbGRTZWxlY3QpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RMb2FkZXIpO1xyXG5cdFx0XHR0cGxFbC5hcHBlbmRDaGlsZChuZXdGaWVsZERpdik7XHJcblxyXG5cdFx0XHRyZXR1cm4gbmV3RmllbGRTZWxlY3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93cyBhdmFpbGJsZSB0aXJlIGNvbmZpZ3VyYXRpb25zIHRvIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFRpcmVDb25maWcoKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J3ZlaGljbGUvZ2V0dGlyZW9wdGlvbmRldGFpbHMnLCBkYXRhOntWZWhpY2xlQ29uZmlndXJhdGlvbnM6IFtiZXN0Q29uZmlndXJhdGlvbklkXX19KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlICYmIHJlc3BvbnNlLkRldGFpbHMubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0dmVoaWNsZU1vZGVsLnRpcmUgPSAnJztcclxuXHRcdFx0XHRcdFx0bGV0IHRpcmVPcHRpb25zID0ge09wdGlvbnM6IHJlc3BvbnNlLkRldGFpbHN9XHJcblx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnModGlyZU9wdGlvbnMsIHRydWUpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBCdWlsZCB0aGUgdXJsIHRoYXQgd2lsbCB0YWtlIHVzZXJzIHRvIHRoZSBzaG93Y2FzZSB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGJ1aWxkVXJsKCl7XHJcblx0XHRcdGxldCB1cmwgPSBvcHRpb25zLnVybDtcclxuXHJcblx0XHRcdGlmKHVybC5pbmRleE9mKCc/JykgPT0gLTEpIHVybCArPSAnPyc7XHJcblx0XHRcdGVsc2UgdXJsICs9ICcmJztcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuYXBpS2V5KXtcclxuXHRcdFx0XHR1cmwgKz0gb3B0aW9ucy5hcGlLZXkgKyBcIiNcIjtcclxuXHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRzaG93QnV0dG9uKHVybCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdFx0Z2V0UlNBcGlLZXkoKS50aGVuKGZ1bmN0aW9uKGFwaUtleSl7IFxyXG5cdFx0XHRcdFx0XHR1cmwgKz0gYXBpS2V5ICsgXCIjXCI7IFxyXG5cdFx0XHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0XHRcdGlmKGJlc3RUaXJlQ29uZmlnSWQpIHVybCArPSBcIiZ0bz1cIiArIGJlc3RUaXJlQ29uZmlnSWQ7XHJcblx0XHRcdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgdXNlcnMgUmlkZVN0eWxlciBhcGkga2V5XHJcblx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRSU0FwaUtleSgpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjpcIkFwaUFjY2Vzc0tleS9HZXRTaGFyZWRLZXlcIn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlLktleSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93IHRoZSBidXR0b24gdGhhdCB3aWxsIGRpcmVjdCB1c2VycyB0byBzaG93Y2FzZSBnaXZlbiBhIHVybCB0byB0aGUgc2hvd2Nhc2UuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2hvd0J1dHRvbih1cmwpe1xyXG5cdFx0XHRsZXQgY29uZmlybUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25UZXh0KSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IG9wdGlvbnMuYnV0dG9uVGV4dDtcclxuXHRcdFx0ZWxzZSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IFwiU2VlIFdoZWVsc1wiO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25DbGFzc2VzKSBvcHRpb25zLmJ1dHRvbkNsYXNzZXMubWFwKGJ0bkNsYXNzID0+IGNvbmZpcm1CdXR0b24uY2xhc3NMaXN0LmFkZChidG5DbGFzcykpOyAvL2lmIHVzZXIgaGFzIHN1cGVyIHNlY3JldCBzcGVjaWFsIGJ1dHRvbiBjbGFzc2VzXHJcblxyXG5cdFx0XHRjb25maXJtQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR3aW5kb3cub3Blbih1cmwpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKGNvbmZpcm1CdXR0b24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVtb3ZlIGVsZW1lbnQgZnJvbSB0aGUgZG9tIGdpdmVuIHRoZSBuYW1lIGF0dHIgb2YgdGhlIGVsZW1lbnQuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGRlc3Ryb3lGaWVsZChrZXkpe1xyXG5cdFx0XHRsZXQgZmllbGRFbGVtZW50ID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpO1xyXG5cclxuXHRcdFx0aWYoa2V5ICE9PSBcIm1ha2VcIiAmJiBrZXkgIT09IFwibW9kZWxcIil7IC8vaWYgdGhlIGtleSBpcyBub3QgbWFrZSBvciBtb2RlbCwgd2UganVzdCBnZXQgcmlkIG9mIHRoZSBzZWxlY3Rpb24gY29tcGxldGVseVxyXG5cdFx0XHRcdGlmKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKSl7XHJcblx0XHRcdFx0XHR0cGxFbC5yZW1vdmVDaGlsZCh0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJykucGFyZW50RWxlbWVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgeyAvL2lmIHRoZSBrZXkgaXMgbWFrZSBvciBtb2RlbCwgd2UganVzdCByZW1vdmUgdGhlIHNlbGVjdCBvcHRpb25zXHJcblx0XHRcdFx0bGV0IGRpc2FibGVkRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLmlubmVySFRNTCA9ICdTZWxlY3QgYSAnICsga2V5O1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5hcHBlbmRDaGlsZChkaXNhYmxlZEVsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0aW5pdGlhbGl6ZVdpZGdldCgpO1xyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHdpbmRvdy5RdWlja1NlbGVjdCA9IFF1aWNrU2VsZWN0O1xyXG59KSgpO1xyXG4iXX0=
