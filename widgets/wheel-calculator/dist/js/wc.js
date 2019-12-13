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

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  /**
   * WheelCalculator: Render the Wheel Calculator widget within a container element
   * @constructor
   * @param {number} containerId - The id of the widget's parent element
   * @param {Object} options - Optional arguments
   */
  function WheelCalculator(containerId, options) {
    var diameterSelects,
        widthSelects,
        offsetSelects,
        wheels = [{
      Diameter: undefined,
      Width: undefined,
      Offset: undefined,
      Backspace: undefined
    }, {
      Diameter: undefined,
      Width: undefined,
      Offset: undefined,
      Backspace: undefined
    }],
        cdnUrl = "https://static.ridestyler.net/widgets/wheel-calculator/edge",
        tplUrl = cdnUrl + "/html/wc.tpl",
        cssUrl = cdnUrl + "/css/wc.min.css",
        wheelDiamOne,
        wheelDiamTwo,
        wheelDiamDiff,
        wheelWidthOne,
        wheelWidthTwo,
        wheelWidthDiff,
        wheelBackOne,
        wheelBackTwo,
        wheelBackDiff,
        wheelFrontOne,
        wheelFrontTwo,
        wheelFrontDiff,
        wheelOffsetOne,
        wheelOffsetTwo,
        wheelOffsetDiff,
        wheelDetSuspension,
        wheelDetFenders,
        wheelDetWheelWells,
        wheelDetBrakes,
        clearanceNotes,
        disclaimer,
        notesWrapper,
        dimsWrapper,
        dimsToggle,
        notesToggle,
        containerElement = document.getElementById(containerId);

    if (options && options.dev) {
      tplUrl = "src/html/wc.tpl";
      cssUrl = "src/css/wc.css";
    }
    /**
     * Runs when DOM content loaded. Load resources, then initialize UI.
     */


    function onDomReady() {
      loadStyles().then(function () {
        loadTpl().then(function () {
          initializeUi();
        });
      });
    }
    /**
     * load stylesheet from cdn
     */


    function loadStyles() {
      return new _promisePolyfill["default"](function (resolve) {
        var css = document.createElement('link');
        css.rel = "stylesheet";
        css.href = cssUrl;
        document.getElementsByTagName('head')[0].appendChild(css);

        css.onload = function () {
          resolve();
        };
      });
    }
    /**
     * load tpl from cdn
     */


    function loadTpl() {
      return new _promisePolyfill["default"](function (resolve) {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
          var completed = 4;

          if (xhr.readyState === completed) {
            if (xhr.status === 200) {
              containerElement.innerHTML = xhr.responseText;
              resolve();
            } else {
              console.error('template failed to load');
            }
          }
        };

        xhr.open('GET', tplUrl, true);
        xhr.send(null);
      });
    }
    /**
     * initialize ui for template
     */


    function initializeUi() {
      wheelDiamOne = document.querySelector('#wc-wheel-diam0');
      wheelDiamTwo = document.querySelector('#wc-wheel-diam1');
      wheelDiamDiff = document.querySelector('#wc-diam-diff');
      wheelWidthOne = document.querySelector('#wc-wheel-width0');
      wheelWidthTwo = document.querySelector('#wc-wheel-width1');
      wheelWidthDiff = document.querySelector('#wc-width-diff');
      wheelBackOne = document.querySelector('#wc-wheel-backspace0');
      wheelBackTwo = document.querySelector('#wc-wheel-backspace1');
      wheelBackDiff = document.querySelector('#wc-backspace-diff');
      wheelFrontOne = document.querySelector('#wc-wheel-frontspace0');
      wheelFrontTwo = document.querySelector('#wc-wheel-frontspace1');
      wheelFrontDiff = document.querySelector('#wc-frontspace-diff');
      wheelOffsetOne = document.querySelector('#wc-wheel-offset0');
      wheelOffsetTwo = document.querySelector('#wc-wheel-offset1');
      wheelOffsetDiff = document.querySelector('#wc-offset-diff');
      diameterSelects = document.querySelectorAll('.wc-firsti');
      widthSelects = document.querySelectorAll('.wc-secondi');
      offsetSelects = document.querySelectorAll('.wc-thirdi');
      wheelDetSuspension = document.querySelector('#wc-details-suspension');
      wheelDetFenders = document.querySelector('#wc-details-fenders');
      wheelDetWheelWells = document.querySelector('#wc-details-wheelwells');
      wheelDetBrakes = document.querySelector('#wc-details-brakes');
      clearanceNotes = document.querySelector('#wc-clearance-container');
      disclaimer = document.querySelector('#wc-disclaimer');
      notesWrapper = document.querySelector('#Notes');
      notesToggle = document.querySelector('#notes');
      dimsWrapper = document.querySelector('#Dimensions');
      dimsToggle = document.querySelector('#dims');

      if (options && options.disclaimer) {
        disclaimer.innerHTML = options.disclaimer;
      } else {
        disclaimer.innerHTML = "This tool is for estimation purposes only. You should consult a professional and confirm measurements prior to making any modifications to your vehicle.";
      }

      addListeners(diameterSelects, 'change', onFirstChange);
      addListeners(widthSelects, 'change', onSecondChange);
      addListeners(offsetSelects, 'change', onThirdChange);
      addListeners(dimsToggle, 'click', toggleResults);
      addListeners(notesToggle, 'click', toggleResults);
      getWheelDiameters();
    }
    /**
     * get wheel diameters, populate diameter select
     */


    function getWheelDiameters() {
      var count = 12,
          wheelDiameterMax = 30,
          wheelDiameters = [];

      while (count < wheelDiameterMax + 1) {
        wheelDiameters.push(count);
        count++;
      }

      wheelDiameters.unshift("Diameter");
      populateField(diameterSelects[0], wheelDiameters);
      populateField(diameterSelects[1], wheelDiameters);
    }
    /**
     * get wheel widths given the current diameter input, populate width select
     * @param {DOMElement} element - diameter input elements
     */


    function getWheelWidths(element) {
      element = element.target;
      var nextEl = element.parentElement.nextElementSibling.children[0],
          count = 4,
          wheelWidthMax = 12.5,
          wheelWidths = [];

      while (count < wheelWidthMax + .5) {
        wheelWidths.push(count);
        count += .5;
      }

      wheelWidths.unshift("Width");
      populateField(nextEl, wheelWidths);
    }
    /**
     * get wheel offsets given the current width input, populate offset select
     * @param {DOMElement} element - width input element
     */


    function getWheelOffsets(element) {
      element = element.target;
      var nextEl = element.parentElement.nextElementSibling.children[0],
          count = -65,
          wheelOffetMax = 125,
          wheelOffsets = [];

      while (count < wheelOffetMax + 1) {
        wheelOffsets.push(count);
        count++;
      }

      wheelOffsets.unshift("Offset");
      populateField(nextEl, wheelOffsets);
    }
    /**
     * populate select fields with given data
     * @param {NodeList} field - element you want to populate
     * @param {array} dataArray - data you to add to element
     */


    function populateField(field, dataArray) {
      dataArray.forEach(function (data) {
        var option = document.createElement('option');
        option.value = data;
        option.innerHTML = data;
        field.appendChild(option);
      });
      if (field.disabled) field.disabled = false;
    }
    /**
     * call ridestyler api to compare two given wheels
     */


    function getCompareData() {
      var requestData = {
        BaseSize: wheels[0].Diameter + "x" + wheels[0].Width + " ET" + wheels[0].Offset,
        "NewSizes[0]": wheels[1].Diameter + "x" + wheels[1].Width + " ET" + wheels[1].Offset
      };
      sendRequest("Wheel/CompareSizes", requestData).then(function (comparisonData) {
        if (comparisonData) {
          displayCompareData(comparisonData);
        }
      });
    }

    function displayCompareData(comparisonData) {
      wheelDiamOne.innerHTML = verifyData(comparisonData.BaseSize.DisplayDiameter);
      wheelDiamTwo.innerHTML = verifyData(comparisonData.NewSizes[0].DisplayDiameter);
      wheelDiamDiff.innerHTML = verifyData(comparisonData.Differences[0].Diameter.Percent, "diff");
      wheelWidthOne.innerHTML = verifyData(comparisonData.BaseSize.DisplayWidth).toFixed(1);
      wheelWidthTwo.innerHTML = verifyData(comparisonData.NewSizes[0].DisplayWidth).toFixed(1);
      wheelWidthDiff.innerHTML = verifyData(comparisonData.Differences[0].Width.Percent, "diff");
      wheelBackOne.innerHTML = verifyData(comparisonData.BaseSize.DisplayBackspacing).toFixed(2);
      wheelBackTwo.innerHTML = verifyData(comparisonData.NewSizes[0].DisplayBackspacing).toFixed(2);
      wheelBackDiff.innerHTML = verifyData(comparisonData.Differences[0].Backspacing.Percent, "diff");
      wheelFrontOne.innerHTML = verifyData(comparisonData.BaseSize.DisplayFrontspacing).toFixed(2);
      wheelFrontTwo.innerHTML = verifyData(comparisonData.NewSizes[0].DisplayFrontspacing).toFixed(2);
      wheelFrontDiff.innerHTML = verifyData(comparisonData.Differences[0].Frontspacing.Percent, "diff");
      wheelOffsetOne.innerHTML = verifyData(comparisonData.BaseSize.DisplayOffset);
      wheelOffsetTwo.innerHTML = verifyData(comparisonData.NewSizes[0].DisplayOffset);
      wheelOffsetDiff.innerHTML = verifyData(comparisonData.Differences[0].Offset.Percent, "diff");
      verifyData(comparisonData.Messages[0][0], "message", wheelDetSuspension);
      verifyData(comparisonData.Messages[0][1], "message", wheelDetFenders);
      verifyData(comparisonData.Messages[0][2], "message", wheelDetWheelWells);
      verifyData(comparisonData.Messages[0][3], "message", wheelDetBrakes);

      function verifyData(data, type, el) {
        var returnData = data;

        if (type === "diff") {
          if (isNaN(parseInt(returnData)) === false) {
            returnData = returnData.toFixed(2) + "%";
          }
        } else if (type === "message") {
          clearanceNotes.style.display = 'block';

          if (returnData.Type == 1) {
            el.classList.remove('wc-error');
            el.classList.remove('wc-warning');
            el.classList.add('wc-warning');
          } else if (returnData.Type == 2) {
            el.classList.remove('wc-error');
            el.classList.remove('wc-warning');
            el.classList.add('wc-error');
          } else {
            el.classList.remove('wc-error');
            el.classList.remove('wc-warning');
          }

          returnData = returnData.Message;
        }

        if (returnData !== undefined && el === undefined) {
          return returnData;
        } else if (el !== undefined) {
          el.innerHTML = returnData;
        }
      }
    }
    /**
     * Update our wheel object with new values
     * @param {DOM Element} e - DOM element
     */


    function updateWheelObject(e) {
      var wheelElement = e.target,
          wheelIndex = wheelElement.id.charAt(wheelElement.id.length - 1),
          wheelValue = wheelElement.value;

      if (wheelElement.classList.contains('wc-firsti')) {
        wheels[wheelIndex]["Diameter"] = wheelValue;
      } else if (wheelElement.classList.contains('wc-secondi')) {
        wheels[wheelIndex]["Width"] = wheelValue;
      } else {
        wheels[wheelIndex]["Offset"] = wheelValue;
        wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
      }

      if (wheels[0].Offset !== undefined && wheels[1].Offset !== undefined) {
        getCompareData();
      }
    }
    /**
     * Generate backspacing given the with and offset
     * @param {int} width - width of wheel
     * @param {int} offset - offset of wheel
     */


    function getBackspacing(width, offset) {
      var backSpacing,
          offsetInInches = mmToInches(offset),
          wheelCenter = parseInt(width / 2);
      backSpacing = wheelCenter + offsetInInches;
      return backSpacing;
    }
    /**
     * mm to inches
     * @param {int} mm - mm measurement
     */


    function mmToInches(mm) {
      var inches,
          mmToInch = 25.4;
      inches = parseInt((mm / mmToInch).toFixed(2));
      return inches;
    }
    /**
     * Send ridestyler api request
     * @param {string} endpoint - endpoint for request
     * @param {object||formData} data - data to include in request
     */


    function sendRequest(endpoint, data) {
      return new _promisePolyfill["default"](function (resolve) {
        ridestyler.ajax.send({
          action: endpoint,
          data: data,
          callback: function callback(res) {
            resolve(res);
          }
        });
      });
    }
    /**
     * Add a listener to a DOM Element
     * @param {DOMElement} el - dom element
     * @param {string} listener - type of event listener
     * @param {function} cb - callback function
     */


    function addListeners(el, listener, cb) {
      if (_typeof(el) === "object" && Object.keys(el).length > 1 || typeof el === "array") {
        for (var e in el) {
          if (_typeof(el[e]) == "object") el[e].addEventListener(listener, cb);
        }
      } else {
        el.addEventListener(listener, cb);
      }
    }
    /**
     * first select change
     * @param {DOM Element} e - select element
     */


    function onFirstChange(e) {
      updateWheelObject(e);
      getWheelWidths(e);
    }
    /**
     * second select change
     * @param {DOM Element} e - select element
     */


    function onSecondChange(e) {
      updateWheelObject(e);
      getWheelOffsets(e);
    }
    /**
     * third select change
     * @param {DOM Element} e - select element
     */


    function onThirdChange(e) {
      updateWheelObject(e);
    }

    function toggleResults(e) {
      if (e.target.id == "dims") {
        notesWrapper.style.display = "none";
        dimsWrapper.style.display = "block";
        notesToggle.classList.remove('selected');
        dimsToggle.classList.add('selected');
      } else {
        dimsWrapper.style.display = "none";
        notesWrapper.style.display = "block";
        dimsToggle.classList.remove('selected');
        notesToggle.classList.add('selected');
      }
    }
    /**
     * On window load DOM content
     */


    if (!containerElement) {
      document.addEventListener("DOMContentLoaded", function (event) {
        containerElement = document.getElementById(containerId);
        onDomReady();
      });
    } else {
      onDomReady();
    }
  }

  window.WheelCalculator = WheelCalculator;
})();

},{"promise-polyfill":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3RpbWVycy1icm93c2VyaWZ5L21haW4uanMiLCJzcmMvanMvV2hlZWxDYWxjdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMzRUE7Ozs7OztBQUVBLENBQUMsWUFBWTtBQUNaOzs7Ozs7QUFNQSxXQUFTLGVBQVQsQ0FBeUIsV0FBekIsRUFBc0MsT0FBdEMsRUFBK0M7QUFDOUMsUUFBSSxlQUFKO0FBQUEsUUFDQyxZQUREO0FBQUEsUUFFQyxhQUZEO0FBQUEsUUFHQyxNQUFNLEdBQUcsQ0FBQztBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBRCxFQUErRTtBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBL0UsQ0FIVjtBQUFBLFFBSUMsTUFBTSxHQUFHLDZEQUpWO0FBQUEsUUFLQyxNQUFNLEdBQUcsTUFBTSxHQUFHLGNBTG5CO0FBQUEsUUFNQyxNQUFNLEdBQUcsTUFBTSxHQUFHLGlCQU5uQjtBQUFBLFFBT0MsWUFQRDtBQUFBLFFBUUMsWUFSRDtBQUFBLFFBU0MsYUFURDtBQUFBLFFBVUMsYUFWRDtBQUFBLFFBV0MsYUFYRDtBQUFBLFFBWUMsY0FaRDtBQUFBLFFBYUMsWUFiRDtBQUFBLFFBY0MsWUFkRDtBQUFBLFFBZUMsYUFmRDtBQUFBLFFBZ0JDLGFBaEJEO0FBQUEsUUFpQkMsYUFqQkQ7QUFBQSxRQWtCQyxjQWxCRDtBQUFBLFFBbUJDLGNBbkJEO0FBQUEsUUFvQkMsY0FwQkQ7QUFBQSxRQXFCQyxlQXJCRDtBQUFBLFFBc0JDLGtCQXRCRDtBQUFBLFFBdUJDLGVBdkJEO0FBQUEsUUF3QkMsa0JBeEJEO0FBQUEsUUF5QkMsY0F6QkQ7QUFBQSxRQTBCQyxjQTFCRDtBQUFBLFFBMkJDLFVBM0JEO0FBQUEsUUE0QkMsWUE1QkQ7QUFBQSxRQTZCQyxXQTdCRDtBQUFBLFFBOEJDLFVBOUJEO0FBQUEsUUErQkMsV0EvQkQ7QUFBQSxRQWdDQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUF4QixDQWhDcEI7O0FBa0NDLFFBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUF0QixFQUEwQjtBQUN6QixNQUFBLE1BQU0sR0FBRyxpQkFBVDtBQUNBLE1BQUEsTUFBTSxHQUFHLGdCQUFUO0FBQ0E7QUFFRjs7Ozs7QUFHQSxhQUFTLFVBQVQsR0FBcUI7QUFDcEIsTUFBQSxVQUFVLEdBQUcsSUFBYixDQUFrQixZQUFVO0FBQzNCLFFBQUEsT0FBTyxHQUFHLElBQVYsQ0FBZSxZQUFVO0FBQ3hCLFVBQUEsWUFBWTtBQUNaLFNBRkQ7QUFHQSxPQUpEO0FBS0E7QUFFRDs7Ozs7QUFHQSxhQUFTLFVBQVQsR0FBcUI7QUFDcEIsYUFBTyxJQUFJLDJCQUFKLENBQVksVUFBUyxPQUFULEVBQWlCO0FBQ25DLFlBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVY7QUFFQSxRQUFBLEdBQUcsQ0FBQyxHQUFKLEdBQVUsWUFBVjtBQUNBLFFBQUEsR0FBRyxDQUFDLElBQUosR0FBVyxNQUFYO0FBQ0EsUUFBQSxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsTUFBOUIsRUFBc0MsQ0FBdEMsRUFBeUMsV0FBekMsQ0FBcUQsR0FBckQ7O0FBRUEsUUFBQSxHQUFHLENBQUMsTUFBSixHQUFhLFlBQVU7QUFDdEIsVUFBQSxPQUFPO0FBQ1AsU0FGRDtBQUdBLE9BVk0sQ0FBUDtBQVdBO0FBRUQ7Ozs7O0FBR0EsYUFBUyxPQUFULEdBQWtCO0FBQ2pCLGFBQU8sSUFBSSwyQkFBSixDQUFZLFVBQVMsT0FBVCxFQUFpQjtBQUNuQyxZQUFJLEdBQUcsR0FBRyxJQUFJLGNBQUosRUFBVjs7QUFFQSxRQUFBLEdBQUcsQ0FBQyxrQkFBSixHQUF5QixZQUFXO0FBQ25DLGNBQUksU0FBUyxHQUFHLENBQWhCOztBQUVBLGNBQUksR0FBRyxDQUFDLFVBQUosS0FBbUIsU0FBdkIsRUFBa0M7QUFDakMsZ0JBQUksR0FBRyxDQUFDLE1BQUosS0FBZSxHQUFuQixFQUF3QjtBQUN2QixjQUFBLGdCQUFnQixDQUFDLFNBQWpCLEdBQTZCLEdBQUcsQ0FBQyxZQUFqQztBQUNBLGNBQUEsT0FBTztBQUNQLGFBSEQsTUFHTztBQUNOLGNBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyx5QkFBZDtBQUNBO0FBQ0Q7QUFDRCxTQVhEOztBQWFBLFFBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFULEVBQWdCLE1BQWhCLEVBQXdCLElBQXhCO0FBQ0EsUUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQ7QUFDQSxPQWxCTSxDQUFQO0FBbUJBO0FBRUQ7Ozs7O0FBR0EsYUFBUyxZQUFULEdBQXVCO0FBQ3RCLE1BQUEsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUF2QixDQUFmO0FBQ0EsTUFBQSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsaUJBQXZCLENBQWY7QUFDQSxNQUFBLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixlQUF2QixDQUFoQjtBQUNBLE1BQUEsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixDQUFoQjtBQUNBLE1BQUEsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixDQUFoQjtBQUNBLE1BQUEsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QixDQUFqQjtBQUNBLE1BQUEsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLHNCQUF2QixDQUFmO0FBQ0EsTUFBQSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsc0JBQXZCLENBQWY7QUFDQSxNQUFBLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixvQkFBdkIsQ0FBaEI7QUFDQSxNQUFBLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBaEI7QUFDQSxNQUFBLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBaEI7QUFDQSxNQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixxQkFBdkIsQ0FBakI7QUFDQSxNQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixtQkFBdkIsQ0FBakI7QUFDQSxNQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixtQkFBdkIsQ0FBakI7QUFDQSxNQUFBLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixpQkFBdkIsQ0FBbEI7QUFDQSxNQUFBLGVBQWUsR0FBRyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsWUFBMUIsQ0FBbEI7QUFDQSxNQUFBLFlBQVksR0FBRyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsYUFBMUIsQ0FBZjtBQUNBLE1BQUEsYUFBYSxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixZQUExQixDQUFoQjtBQUNBLE1BQUEsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsd0JBQXZCLENBQXJCO0FBQ0EsTUFBQSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIscUJBQXZCLENBQWxCO0FBQ0EsTUFBQSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1Qix3QkFBdkIsQ0FBckI7QUFDQSxNQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixvQkFBdkIsQ0FBakI7QUFDQSxNQUFBLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1Qix5QkFBdkIsQ0FBakI7QUFDQSxNQUFBLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixnQkFBdkIsQ0FBYjtBQUNBLE1BQUEsWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCLENBQWY7QUFDQSxNQUFBLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QixDQUFkO0FBQ0EsTUFBQSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsYUFBdkIsQ0FBZDtBQUNBLE1BQUEsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLENBQWI7O0FBRUEsVUFBRyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQXRCLEVBQWlDO0FBQ2hDLFFBQUEsVUFBVSxDQUFDLFNBQVgsR0FBdUIsT0FBTyxDQUFDLFVBQS9CO0FBQ0EsT0FGRCxNQUVPO0FBQ04sUUFBQSxVQUFVLENBQUMsU0FBWCxHQUF1QiwwSkFBdkI7QUFDQTs7QUFFRCxNQUFBLFlBQVksQ0FBQyxlQUFELEVBQWtCLFFBQWxCLEVBQTRCLGFBQTVCLENBQVo7QUFDQSxNQUFBLFlBQVksQ0FBQyxZQUFELEVBQWUsUUFBZixFQUF5QixjQUF6QixDQUFaO0FBQ0EsTUFBQSxZQUFZLENBQUMsYUFBRCxFQUFnQixRQUFoQixFQUEwQixhQUExQixDQUFaO0FBQ0EsTUFBQSxZQUFZLENBQUMsVUFBRCxFQUFhLE9BQWIsRUFBc0IsYUFBdEIsQ0FBWjtBQUNBLE1BQUEsWUFBWSxDQUFDLFdBQUQsRUFBYyxPQUFkLEVBQXVCLGFBQXZCLENBQVo7QUFFQSxNQUFBLGlCQUFpQjtBQUNqQjtBQUdEOzs7OztBQUdBLGFBQVMsaUJBQVQsR0FBNEI7QUFDM0IsVUFBSSxLQUFLLEdBQUcsRUFBWjtBQUFBLFVBQ0MsZ0JBQWdCLEdBQUcsRUFEcEI7QUFBQSxVQUVDLGNBQWMsR0FBRyxFQUZsQjs7QUFJQSxhQUFNLEtBQUssR0FBRyxnQkFBZ0IsR0FBRyxDQUFqQyxFQUFtQztBQUNsQyxRQUFBLGNBQWMsQ0FBQyxJQUFmLENBQW9CLEtBQXBCO0FBQ0EsUUFBQSxLQUFLO0FBQ0w7O0FBRUQsTUFBQSxjQUFjLENBQUMsT0FBZixDQUF1QixVQUF2QjtBQUVBLE1BQUEsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFELENBQWhCLEVBQXFCLGNBQXJCLENBQWI7QUFDQSxNQUFBLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBRCxDQUFoQixFQUFxQixjQUFyQixDQUFiO0FBQ0E7QUFFRDs7Ozs7O0FBSUEsYUFBUyxjQUFULENBQXdCLE9BQXhCLEVBQWdDO0FBQy9CLE1BQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFsQjtBQUVBLFVBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxhQUFSLENBQXNCLGtCQUF0QixDQUF5QyxRQUF6QyxDQUFrRCxDQUFsRCxDQUFiO0FBQUEsVUFDQyxLQUFLLEdBQUcsQ0FEVDtBQUFBLFVBRUMsYUFBYSxHQUFHLElBRmpCO0FBQUEsVUFHQyxXQUFXLEdBQUcsRUFIZjs7QUFLQSxhQUFNLEtBQUssR0FBRyxhQUFhLEdBQUcsRUFBOUIsRUFBaUM7QUFDaEMsUUFBQSxXQUFXLENBQUMsSUFBWixDQUFpQixLQUFqQjtBQUNBLFFBQUEsS0FBSyxJQUFFLEVBQVA7QUFDQTs7QUFFRCxNQUFBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLE9BQXBCO0FBRUEsTUFBQSxhQUFhLENBQUMsTUFBRCxFQUFTLFdBQVQsQ0FBYjtBQUNBO0FBRUQ7Ozs7OztBQUlBLGFBQVMsZUFBVCxDQUF5QixPQUF6QixFQUFpQztBQUNoQyxNQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBbEI7QUFFQSxVQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsYUFBUixDQUFzQixrQkFBdEIsQ0FBeUMsUUFBekMsQ0FBa0QsQ0FBbEQsQ0FBYjtBQUFBLFVBQ0MsS0FBSyxHQUFHLENBQUMsRUFEVjtBQUFBLFVBRUMsYUFBYSxHQUFHLEdBRmpCO0FBQUEsVUFHQyxZQUFZLEdBQUcsRUFIaEI7O0FBS0EsYUFBTSxLQUFLLEdBQUcsYUFBYSxHQUFHLENBQTlCLEVBQWdDO0FBQy9CLFFBQUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBbEI7QUFDQSxRQUFBLEtBQUs7QUFDTDs7QUFFRCxNQUFBLFlBQVksQ0FBQyxPQUFiLENBQXFCLFFBQXJCO0FBRUEsTUFBQSxhQUFhLENBQUMsTUFBRCxFQUFTLFlBQVQsQ0FBYjtBQUNBO0FBRUQ7Ozs7Ozs7QUFLQSxhQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsU0FBOUIsRUFBd0M7QUFDdkMsTUFBQSxTQUFTLENBQUMsT0FBVixDQUFrQixVQUFTLElBQVQsRUFBYztBQUMvQixZQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QixDQUFiO0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQWY7QUFDQSxRQUFBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLElBQW5CO0FBRUEsUUFBQSxLQUFLLENBQUMsV0FBTixDQUFrQixNQUFsQjtBQUNBLE9BTkQ7QUFRQSxVQUFHLEtBQUssQ0FBQyxRQUFULEVBQW1CLEtBQUssQ0FBQyxRQUFOLEdBQWlCLEtBQWpCO0FBQ25CO0FBRUQ7Ozs7O0FBR0EsYUFBUyxjQUFULEdBQXlCO0FBQ3hCLFVBQUksV0FBVyxHQUFHO0FBQUMsUUFBQSxRQUFRLEVBQUMsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLFFBQVYsR0FBcUIsR0FBckIsR0FBMkIsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLEtBQXJDLEdBQTZDLEtBQTdDLEdBQXFELE1BQU0sQ0FBQyxDQUFELENBQU4sQ0FBVSxNQUF6RTtBQUFpRix1QkFBYyxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsUUFBVixHQUFxQixHQUFyQixHQUEyQixNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsS0FBckMsR0FBNkMsS0FBN0MsR0FBcUQsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVO0FBQTlKLE9BQWxCO0FBRUEsTUFBQSxXQUFXLENBQUMsb0JBQUQsRUFBdUIsV0FBdkIsQ0FBWCxDQUErQyxJQUEvQyxDQUFvRCxVQUFTLGNBQVQsRUFBd0I7QUFDM0UsWUFBRyxjQUFILEVBQWtCO0FBQ2pCLFVBQUEsa0JBQWtCLENBQUMsY0FBRCxDQUFsQjtBQUNBO0FBQ0QsT0FKRDtBQUtBOztBQUVELGFBQVMsa0JBQVQsQ0FBNEIsY0FBNUIsRUFBMkM7QUFDMUMsTUFBQSxZQUFZLENBQUMsU0FBYixHQUF5QixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsZUFBekIsQ0FBbkM7QUFDQSxNQUFBLFlBQVksQ0FBQyxTQUFiLEdBQXlCLFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBZixDQUF3QixDQUF4QixFQUEyQixlQUE1QixDQUFuQztBQUNBLE1BQUEsYUFBYSxDQUFDLFNBQWQsR0FBMEIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFmLENBQTJCLENBQTNCLEVBQThCLFFBQTlCLENBQXVDLE9BQXhDLEVBQWlELE1BQWpELENBQXBDO0FBQ0EsTUFBQSxhQUFhLENBQUMsU0FBZCxHQUEwQixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsWUFBekIsQ0FBVixDQUFpRCxPQUFqRCxDQUF5RCxDQUF6RCxDQUExQjtBQUNBLE1BQUEsYUFBYSxDQUFDLFNBQWQsR0FBMEIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFmLENBQXdCLENBQXhCLEVBQTJCLFlBQTVCLENBQVYsQ0FBb0QsT0FBcEQsQ0FBNEQsQ0FBNUQsQ0FBMUI7QUFDQSxNQUFBLGNBQWMsQ0FBQyxTQUFmLEdBQTJCLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBZixDQUEyQixDQUEzQixFQUE4QixLQUE5QixDQUFvQyxPQUFyQyxFQUE4QyxNQUE5QyxDQUFyQztBQUNBLE1BQUEsWUFBWSxDQUFDLFNBQWIsR0FBeUIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFmLENBQXdCLGtCQUF6QixDQUFWLENBQXVELE9BQXZELENBQStELENBQS9ELENBQXpCO0FBQ0EsTUFBQSxZQUFZLENBQUMsU0FBYixHQUF5QixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsa0JBQTVCLENBQVYsQ0FBMEQsT0FBMUQsQ0FBa0UsQ0FBbEUsQ0FBekI7QUFDQSxNQUFBLGFBQWEsQ0FBQyxTQUFkLEdBQTBCLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBZixDQUEyQixDQUEzQixFQUE4QixXQUE5QixDQUEwQyxPQUEzQyxFQUFvRCxNQUFwRCxDQUFwQztBQUNBLE1BQUEsYUFBYSxDQUFDLFNBQWQsR0FBMEIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFmLENBQXdCLG1CQUF6QixDQUFWLENBQXdELE9BQXhELENBQWdFLENBQWhFLENBQTFCO0FBQ0EsTUFBQSxhQUFhLENBQUMsU0FBZCxHQUEwQixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsbUJBQTVCLENBQVYsQ0FBMkQsT0FBM0QsQ0FBbUUsQ0FBbkUsQ0FBMUI7QUFDQSxNQUFBLGNBQWMsQ0FBQyxTQUFmLEdBQTJCLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBZixDQUEyQixDQUEzQixFQUE4QixZQUE5QixDQUEyQyxPQUE1QyxFQUFxRCxNQUFyRCxDQUFyQztBQUNBLE1BQUEsY0FBYyxDQUFDLFNBQWYsR0FBMkIsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFmLENBQXdCLGFBQXpCLENBQXJDO0FBQ0EsTUFBQSxjQUFjLENBQUMsU0FBZixHQUEyQixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsYUFBNUIsQ0FBckM7QUFDQSxNQUFBLGVBQWUsQ0FBQyxTQUFoQixHQUE0QixVQUFVLENBQUMsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsQ0FBM0IsRUFBOEIsTUFBOUIsQ0FBcUMsT0FBdEMsRUFBK0MsTUFBL0MsQ0FBdEM7QUFDQSxNQUFBLFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBZixDQUF3QixDQUF4QixFQUEyQixDQUEzQixDQUFELEVBQWdDLFNBQWhDLEVBQTJDLGtCQUEzQyxDQUFWO0FBQ0EsTUFBQSxVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsQ0FBRCxFQUFnQyxTQUFoQyxFQUEyQyxlQUEzQyxDQUFWO0FBQ0EsTUFBQSxVQUFVLENBQUMsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsQ0FBRCxFQUFnQyxTQUFoQyxFQUEyQyxrQkFBM0MsQ0FBVjtBQUNBLE1BQUEsVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFmLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQUQsRUFBZ0MsU0FBaEMsRUFBMkMsY0FBM0MsQ0FBVjs7QUFFQSxlQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsSUFBMUIsRUFBZ0MsRUFBaEMsRUFBbUM7QUFDbEMsWUFBSSxVQUFVLEdBQUcsSUFBakI7O0FBRUEsWUFBRyxJQUFJLEtBQUssTUFBWixFQUFtQjtBQUNsQixjQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBRCxDQUFULENBQUwsS0FBZ0MsS0FBbkMsRUFBeUM7QUFDeEMsWUFBQSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsQ0FBbkIsSUFBd0IsR0FBckM7QUFDQTtBQUNELFNBSkQsTUFJTyxJQUFHLElBQUksS0FBSyxTQUFaLEVBQXVCO0FBQzdCLFVBQUEsY0FBYyxDQUFDLEtBQWYsQ0FBcUIsT0FBckIsR0FBK0IsT0FBL0I7O0FBQ0EsY0FBRyxVQUFVLENBQUMsSUFBWCxJQUFtQixDQUF0QixFQUF3QjtBQUN2QixZQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsTUFBYixDQUFvQixVQUFwQjtBQUNBLFlBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxNQUFiLENBQW9CLFlBQXBCO0FBQ0EsWUFBQSxFQUFFLENBQUMsU0FBSCxDQUFhLEdBQWIsQ0FBaUIsWUFBakI7QUFDQSxXQUpELE1BSU8sSUFBRyxVQUFVLENBQUMsSUFBWCxJQUFtQixDQUF0QixFQUF3QjtBQUM5QixZQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsTUFBYixDQUFvQixVQUFwQjtBQUNBLFlBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxNQUFiLENBQW9CLFlBQXBCO0FBQ0EsWUFBQSxFQUFFLENBQUMsU0FBSCxDQUFhLEdBQWIsQ0FBaUIsVUFBakI7QUFDQSxXQUpNLE1BSUE7QUFDTixZQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsTUFBYixDQUFvQixVQUFwQjtBQUNBLFlBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxNQUFiLENBQW9CLFlBQXBCO0FBQ0E7O0FBQ0QsVUFBQSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQXhCO0FBQ0E7O0FBRUQsWUFBRyxVQUFVLEtBQUssU0FBZixJQUE0QixFQUFFLEtBQUssU0FBdEMsRUFBZ0Q7QUFDL0MsaUJBQU8sVUFBUDtBQUNBLFNBRkQsTUFFTyxJQUFHLEVBQUUsS0FBSyxTQUFWLEVBQXFCO0FBQzNCLFVBQUEsRUFBRSxDQUFDLFNBQUgsR0FBZSxVQUFmO0FBQ0E7QUFDRDtBQUNEO0FBRUQ7Ozs7OztBQUlBLGFBQVMsaUJBQVQsQ0FBMkIsQ0FBM0IsRUFBNkI7QUFDNUIsVUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQXJCO0FBQUEsVUFDQyxVQUFVLEdBQUcsWUFBWSxDQUFDLEVBQWIsQ0FBZ0IsTUFBaEIsQ0FBdUIsWUFBWSxDQUFDLEVBQWIsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBaEQsQ0FEZDtBQUFBLFVBRUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxLQUYzQjs7QUFJQSxVQUFHLFlBQVksQ0FBQyxTQUFiLENBQXVCLFFBQXZCLENBQWdDLFdBQWhDLENBQUgsRUFBZ0Q7QUFDL0MsUUFBQSxNQUFNLENBQUMsVUFBRCxDQUFOLENBQW1CLFVBQW5CLElBQWlDLFVBQWpDO0FBQ0EsT0FGRCxNQUVPLElBQUcsWUFBWSxDQUFDLFNBQWIsQ0FBdUIsUUFBdkIsQ0FBZ0MsWUFBaEMsQ0FBSCxFQUFrRDtBQUN4RCxRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUIsT0FBbkIsSUFBOEIsVUFBOUI7QUFDQSxPQUZNLE1BRUE7QUFDTixRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUIsUUFBbkIsSUFBK0IsVUFBL0I7QUFDQSxRQUFBLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUIsV0FBbkIsSUFBa0MsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFELENBQU4sQ0FBbUIsT0FBbkIsQ0FBRCxFQUE4QixNQUFNLENBQUMsVUFBRCxDQUFOLENBQW1CLFFBQW5CLENBQTlCLENBQWhEO0FBQ0E7O0FBRUQsVUFBRyxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsTUFBVixLQUFxQixTQUFyQixJQUFrQyxNQUFNLENBQUMsQ0FBRCxDQUFOLENBQVUsTUFBVixLQUFxQixTQUExRCxFQUFvRTtBQUNuRSxRQUFBLGNBQWM7QUFDZDtBQUNEO0FBRUQ7Ozs7Ozs7QUFLQSxhQUFTLGNBQVQsQ0FBd0IsS0FBeEIsRUFBK0IsTUFBL0IsRUFBc0M7QUFDckMsVUFBSSxXQUFKO0FBQUEsVUFDQyxjQUFjLEdBQUcsVUFBVSxDQUFDLE1BQUQsQ0FENUI7QUFBQSxVQUVDLFdBQVcsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQVQsQ0FGdkI7QUFJQSxNQUFBLFdBQVcsR0FBSSxXQUFXLEdBQUcsY0FBN0I7QUFFQSxhQUFPLFdBQVA7QUFDQTtBQUVEOzs7Ozs7QUFJQSxhQUFTLFVBQVQsQ0FBb0IsRUFBcEIsRUFBd0I7QUFDdkIsVUFBSSxNQUFKO0FBQUEsVUFDQyxRQUFRLEdBQUcsSUFEWjtBQUdBLE1BQUEsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxRQUFOLEVBQWdCLE9BQWhCLENBQXdCLENBQXhCLENBQUQsQ0FBakI7QUFFQSxhQUFPLE1BQVA7QUFDQTtBQUVEOzs7Ozs7O0FBS0EsYUFBUyxXQUFULENBQXFCLFFBQXJCLEVBQStCLElBQS9CLEVBQW9DO0FBQ25DLGFBQU8sSUFBSSwyQkFBSixDQUFZLFVBQVMsT0FBVCxFQUFpQjtBQUNuQyxRQUFBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCO0FBQ3BCLFVBQUEsTUFBTSxFQUFFLFFBRFk7QUFFcEIsVUFBQSxJQUFJLEVBQUUsSUFGYztBQUdwQixVQUFBLFFBQVEsRUFBRSxrQkFBVSxHQUFWLEVBQWU7QUFDeEIsWUFBQSxPQUFPLENBQUMsR0FBRCxDQUFQO0FBQ0E7QUFMbUIsU0FBckI7QUFPQSxPQVJNLENBQVA7QUFTQTtBQUVEOzs7Ozs7OztBQU1BLGFBQVMsWUFBVCxDQUFzQixFQUF0QixFQUEwQixRQUExQixFQUFvQyxFQUFwQyxFQUF1QztBQUN0QyxVQUFHLFFBQU8sRUFBUCxNQUFjLFFBQWQsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaLEVBQWdCLE1BQWhCLEdBQXlCLENBQW5ELElBQXdELE9BQU8sRUFBUCxLQUFjLE9BQXpFLEVBQWlGO0FBQ2hGLGFBQUksSUFBSSxDQUFSLElBQWEsRUFBYixFQUFnQjtBQUNmLGNBQUcsUUFBTyxFQUFFLENBQUMsQ0FBRCxDQUFULEtBQWdCLFFBQW5CLEVBQTZCLEVBQUUsQ0FBQyxDQUFELENBQUYsQ0FBTSxnQkFBTixDQUF1QixRQUF2QixFQUFpQyxFQUFqQztBQUM3QjtBQUNELE9BSkQsTUFJTztBQUNOLFFBQUEsRUFBRSxDQUFDLGdCQUFILENBQW9CLFFBQXBCLEVBQThCLEVBQTlCO0FBQ0E7QUFDRDtBQUVEOzs7Ozs7QUFJQSxhQUFTLGFBQVQsQ0FBdUIsQ0FBdkIsRUFBeUI7QUFDeEIsTUFBQSxpQkFBaUIsQ0FBQyxDQUFELENBQWpCO0FBQ0EsTUFBQSxjQUFjLENBQUMsQ0FBRCxDQUFkO0FBQ0E7QUFFRDs7Ozs7O0FBSUEsYUFBUyxjQUFULENBQXdCLENBQXhCLEVBQTBCO0FBQ3pCLE1BQUEsaUJBQWlCLENBQUMsQ0FBRCxDQUFqQjtBQUNBLE1BQUEsZUFBZSxDQUFDLENBQUQsQ0FBZjtBQUNBO0FBRUQ7Ozs7OztBQUlBLGFBQVMsYUFBVCxDQUF1QixDQUF2QixFQUF5QjtBQUN4QixNQUFBLGlCQUFpQixDQUFDLENBQUQsQ0FBakI7QUFDQTs7QUFFRCxhQUFTLGFBQVQsQ0FBdUIsQ0FBdkIsRUFBeUI7QUFDeEIsVUFBRyxDQUFDLENBQUMsTUFBRixDQUFTLEVBQVQsSUFBZSxNQUFsQixFQUEwQjtBQUN6QixRQUFBLFlBQVksQ0FBQyxLQUFiLENBQW1CLE9BQW5CLEdBQTZCLE1BQTdCO0FBQ0EsUUFBQSxXQUFXLENBQUMsS0FBWixDQUFrQixPQUFsQixHQUE0QixPQUE1QjtBQUNBLFFBQUEsV0FBVyxDQUFDLFNBQVosQ0FBc0IsTUFBdEIsQ0FBNkIsVUFBN0I7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLEdBQXJCLENBQXlCLFVBQXpCO0FBQ0EsT0FMRCxNQUtPO0FBQ04sUUFBQSxXQUFXLENBQUMsS0FBWixDQUFrQixPQUFsQixHQUE0QixNQUE1QjtBQUNBLFFBQUEsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsT0FBbkIsR0FBNkIsT0FBN0I7QUFDQSxRQUFBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLE1BQXJCLENBQTRCLFVBQTVCO0FBQ0EsUUFBQSxXQUFXLENBQUMsU0FBWixDQUFzQixHQUF0QixDQUEwQixVQUExQjtBQUNBO0FBQ0Q7QUFFRDs7Ozs7QUFHQSxRQUFJLENBQUMsZ0JBQUwsRUFBdUI7QUFDdEIsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLFVBQVMsS0FBVCxFQUFnQjtBQUM3RCxRQUFBLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxjQUFULENBQXdCLFdBQXhCLENBQW5CO0FBQ0EsUUFBQSxVQUFVO0FBQ1YsT0FIRDtBQUlBLEtBTEQsTUFLTztBQUNOLE1BQUEsVUFBVTtBQUNWO0FBQ0Q7O0FBQ0QsRUFBQSxNQUFNLENBQUMsZUFBUCxHQUF5QixlQUF6QjtBQUNBLENBaGJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAdGhpcyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gZmluYWxseUNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG4gIHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuY29uc3RydWN0b3I7XG4gIHJldHVybiB0aGlzLnRoZW4oXG4gICAgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgKTtcbn1cblxuLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbi8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxudmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuZnVuY3Rpb24gaXNBcnJheSh4KSB7XG4gIHJldHVybiBCb29sZWFuKHggJiYgdHlwZW9mIHgubGVuZ3RoICE9PSAndW5kZWZpbmVkJyk7XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbmZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5mdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSAqL1xuICB0aGlzLl9zdGF0ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IWJvb2xlYW59ICovXG4gIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtQcm9taXNlfHVuZGVmaW5lZH0gKi9cbiAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gIC8qKiBAdHlwZSB7IUFycmF5PCFGdW5jdGlvbj59ICovXG4gIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gIH1cbiAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciByZXQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgdHJ5IHtcbiAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZilcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgaWYgKFxuICAgICAgbmV3VmFsdWUgJiZcbiAgICAgICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICApIHtcbiAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3Qoc2VsZiwgZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gIHNlbGYuX3N0YXRlID0gMjtcbiAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgZmluYWxlKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgfVxuICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xufVxuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gIHZhciBkb25lID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgZm4oXG4gICAgICBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgZG9uZSA9IHRydWU7XG4gICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAvLyBAdHMtaWdub3JlXG4gIHZhciBwcm9tID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gIHJldHVybiBwcm9tO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSA9IGZpbmFsbHlDb25zdHJ1Y3RvcjtcblxuUHJvbWlzZS5hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UuYWxsIGFjY2VwdHMgYW4gYXJyYXknKSk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbChcbiAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICByZWplY3QoZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0pO1xufTtcblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59O1xuXG5Qcm9taXNlLnJhY2UgPSBmdW5jdGlvbihhcnIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICghaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1Byb21pc2UucmFjZSBhY2NlcHRzIGFuIGFycmF5JykpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIFByb21pc2UucmVzb2x2ZShhcnJbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG5Qcm9taXNlLl9pbW1lZGlhdGVGbiA9XG4gIC8vIEB0cy1pZ25vcmVcbiAgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiZcbiAgICBmdW5jdGlvbihmbikge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9KSB8fFxuICBmdW5jdGlvbihmbikge1xuICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgfTtcblxuUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgbmV4dFRpY2sgPSByZXF1aXJlKCdwcm9jZXNzL2Jyb3dzZXIuanMnKS5uZXh0VGljaztcbnZhciBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBpbW1lZGlhdGVJZHMgPSB7fTtcbnZhciBuZXh0SW1tZWRpYXRlSWQgPSAwO1xuXG4vLyBET00gQVBJcywgZm9yIGNvbXBsZXRlbmVzc1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0VGltZW91dCwgd2luZG93LCBhcmd1bWVudHMpLCBjbGVhclRpbWVvdXQpO1xufTtcbmV4cG9ydHMuc2V0SW50ZXJ2YWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBUaW1lb3V0KGFwcGx5LmNhbGwoc2V0SW50ZXJ2YWwsIHdpbmRvdywgYXJndW1lbnRzKSwgY2xlYXJJbnRlcnZhbCk7XG59O1xuZXhwb3J0cy5jbGVhclRpbWVvdXQgPVxuZXhwb3J0cy5jbGVhckludGVydmFsID0gZnVuY3Rpb24odGltZW91dCkgeyB0aW1lb3V0LmNsb3NlKCk7IH07XG5cbmZ1bmN0aW9uIFRpbWVvdXQoaWQsIGNsZWFyRm4pIHtcbiAgdGhpcy5faWQgPSBpZDtcbiAgdGhpcy5fY2xlYXJGbiA9IGNsZWFyRm47XG59XG5UaW1lb3V0LnByb3RvdHlwZS51bnJlZiA9IFRpbWVvdXQucHJvdG90eXBlLnJlZiA9IGZ1bmN0aW9uKCkge307XG5UaW1lb3V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9jbGVhckZuLmNhbGwod2luZG93LCB0aGlzLl9pZCk7XG59O1xuXG4vLyBEb2VzIG5vdCBzdGFydCB0aGUgdGltZSwganVzdCBzZXRzIHVwIHRoZSBtZW1iZXJzIG5lZWRlZC5cbmV4cG9ydHMuZW5yb2xsID0gZnVuY3Rpb24oaXRlbSwgbXNlY3MpIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IG1zZWNzO1xufTtcblxuZXhwb3J0cy51bmVucm9sbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuICBpdGVtLl9pZGxlVGltZW91dCA9IC0xO1xufTtcblxuZXhwb3J0cy5fdW5yZWZBY3RpdmUgPSBleHBvcnRzLmFjdGl2ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgY2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO1xuXG4gIHZhciBtc2VjcyA9IGl0ZW0uX2lkbGVUaW1lb3V0O1xuICBpZiAobXNlY3MgPj0gMCkge1xuICAgIGl0ZW0uX2lkbGVUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uIG9uVGltZW91dCgpIHtcbiAgICAgIGlmIChpdGVtLl9vblRpbWVvdXQpXG4gICAgICAgIGl0ZW0uX29uVGltZW91dCgpO1xuICAgIH0sIG1zZWNzKTtcbiAgfVxufTtcblxuLy8gVGhhdCdzIG5vdCBob3cgbm9kZS5qcyBpbXBsZW1lbnRzIGl0IGJ1dCB0aGUgZXhwb3NlZCBhcGkgaXMgdGhlIHNhbWUuXG5leHBvcnRzLnNldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEltbWVkaWF0ZSA6IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBpZCA9IG5leHRJbW1lZGlhdGVJZCsrO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gZmFsc2UgOiBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgaW1tZWRpYXRlSWRzW2lkXSA9IHRydWU7XG5cbiAgbmV4dFRpY2soZnVuY3Rpb24gb25OZXh0VGljaygpIHtcbiAgICBpZiAoaW1tZWRpYXRlSWRzW2lkXSkge1xuICAgICAgLy8gZm4uY2FsbCgpIGlzIGZhc3RlciBzbyB3ZSBvcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiB1c2UtY2FzZVxuICAgICAgLy8gQHNlZSBodHRwOi8vanNwZXJmLmNvbS9jYWxsLWFwcGx5LXNlZ3VcbiAgICAgIGlmIChhcmdzKSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uY2FsbChudWxsKTtcbiAgICAgIH1cbiAgICAgIC8vIFByZXZlbnQgaWRzIGZyb20gbGVha2luZ1xuICAgICAgZXhwb3J0cy5jbGVhckltbWVkaWF0ZShpZCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5leHBvcnRzLmNsZWFySW1tZWRpYXRlID0gdHlwZW9mIGNsZWFySW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIgPyBjbGVhckltbWVkaWF0ZSA6IGZ1bmN0aW9uKGlkKSB7XG4gIGRlbGV0ZSBpbW1lZGlhdGVJZHNbaWRdO1xufTsiLCJpbXBvcnQgUHJvbWlzZSBmcm9tICdwcm9taXNlLXBvbHlmaWxsJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogV2hlZWxDYWxjdWxhdG9yOiBSZW5kZXIgdGhlIFdoZWVsIENhbGN1bGF0b3Igd2lkZ2V0IHdpdGhpbiBhIGNvbnRhaW5lciBlbGVtZW50XHJcblx0ICogQGNvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGNvbnRhaW5lcklkIC0gVGhlIGlkIG9mIHRoZSB3aWRnZXQncyBwYXJlbnQgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgYXJndW1lbnRzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gV2hlZWxDYWxjdWxhdG9yKGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgZGlhbWV0ZXJTZWxlY3RzLFxyXG5cdFx0XHR3aWR0aFNlbGVjdHMsXHJcblx0XHRcdG9mZnNldFNlbGVjdHMsXHJcblx0XHRcdHdoZWVscyA9IFt7RGlhbWV0ZXI6dW5kZWZpbmVkLCBXaWR0aDp1bmRlZmluZWQsIE9mZnNldDp1bmRlZmluZWQsIEJhY2tzcGFjZTp1bmRlZmluZWR9LCB7RGlhbWV0ZXI6dW5kZWZpbmVkLCBXaWR0aDp1bmRlZmluZWQsIE9mZnNldDp1bmRlZmluZWQsIEJhY2tzcGFjZTp1bmRlZmluZWR9XSxcclxuXHRcdFx0Y2RuVXJsID0gXCJodHRwczovL3N0YXRpYy5yaWRlc3R5bGVyLm5ldC93aWRnZXRzL3doZWVsLWNhbGN1bGF0b3IvZWRnZVwiLFxyXG5cdFx0XHR0cGxVcmwgPSBjZG5VcmwgKyBcIi9odG1sL3djLnRwbFwiLFxyXG5cdFx0XHRjc3NVcmwgPSBjZG5VcmwgKyBcIi9jc3Mvd2MubWluLmNzc1wiLFxyXG5cdFx0XHR3aGVlbERpYW1PbmUsXHJcblx0XHRcdHdoZWVsRGlhbVR3byxcclxuXHRcdFx0d2hlZWxEaWFtRGlmZixcclxuXHRcdFx0d2hlZWxXaWR0aE9uZSxcclxuXHRcdFx0d2hlZWxXaWR0aFR3byxcclxuXHRcdFx0d2hlZWxXaWR0aERpZmYsXHJcblx0XHRcdHdoZWVsQmFja09uZSxcclxuXHRcdFx0d2hlZWxCYWNrVHdvLFxyXG5cdFx0XHR3aGVlbEJhY2tEaWZmLFxyXG5cdFx0XHR3aGVlbEZyb250T25lLFxyXG5cdFx0XHR3aGVlbEZyb250VHdvLFxyXG5cdFx0XHR3aGVlbEZyb250RGlmZixcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUsXHJcblx0XHRcdHdoZWVsT2Zmc2V0VHdvLFxyXG5cdFx0XHR3aGVlbE9mZnNldERpZmYsXHJcblx0XHRcdHdoZWVsRGV0U3VzcGVuc2lvbixcclxuXHRcdFx0d2hlZWxEZXRGZW5kZXJzLFxyXG5cdFx0XHR3aGVlbERldFdoZWVsV2VsbHMsXHJcblx0XHRcdHdoZWVsRGV0QnJha2VzLFxyXG5cdFx0XHRjbGVhcmFuY2VOb3RlcyxcclxuXHRcdFx0ZGlzY2xhaW1lcixcclxuXHRcdFx0bm90ZXNXcmFwcGVyLFxyXG5cdFx0XHRkaW1zV3JhcHBlcixcclxuXHRcdFx0ZGltc1RvZ2dsZSxcclxuXHRcdFx0bm90ZXNUb2dnbGUsXHJcblx0XHRcdGNvbnRhaW5lckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJZCk7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zICYmIG9wdGlvbnMuZGV2KXtcclxuXHRcdFx0XHR0cGxVcmwgPSBcInNyYy9odG1sL3djLnRwbFwiO1xyXG5cdFx0XHRcdGNzc1VybCA9IFwic3JjL2Nzcy93Yy5jc3NcIjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUnVucyB3aGVuIERPTSBjb250ZW50IGxvYWRlZC4gTG9hZCByZXNvdXJjZXMsIHRoZW4gaW5pdGlhbGl6ZSBVSS5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gb25Eb21SZWFkeSgpe1xyXG5cdFx0XHRsb2FkU3R5bGVzKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRpbml0aWFsaXplVWkoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBsb2FkIHN0eWxlc2hlZXQgZnJvbSBjZG5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFN0eWxlcygpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0bGV0IGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuXHJcblx0XHRcdFx0Y3NzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xyXG5cdFx0XHRcdGNzcy5ocmVmID0gY3NzVXJsO1xyXG5cdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoY3NzKTtcclxuXHJcblx0XHRcdFx0Y3NzLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGxvYWQgdHBsIGZyb20gY2RuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRUcGwoKXsgXHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHJcblx0XHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0dmFyIGNvbXBsZXRlZCA9IDQ7XHJcblx0XHRcclxuXHRcdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gY29tcGxldGVkKSB7XHJcblx0XHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcclxuXHRcdFx0XHRcdFx0XHRjb250YWluZXJFbGVtZW50LmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3RlbXBsYXRlIGZhaWxlZCB0byBsb2FkJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHJcblx0XHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHRwbFVybCwgdHJ1ZSk7XHJcblx0XHRcdFx0eGhyLnNlbmQobnVsbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogaW5pdGlhbGl6ZSB1aSBmb3IgdGVtcGxhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVVpKCl7XHJcblx0XHRcdHdoZWVsRGlhbU9uZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy13aGVlbC1kaWFtMCcpO1xyXG5cdFx0XHR3aGVlbERpYW1Ud28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2hlZWwtZGlhbTEnKTtcclxuXHRcdFx0d2hlZWxEaWFtRGlmZiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy1kaWFtLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxXaWR0aE9uZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy13aGVlbC13aWR0aDAnKTtcclxuXHRcdFx0d2hlZWxXaWR0aFR3byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy13aGVlbC13aWR0aDEnKTtcclxuXHRcdFx0d2hlZWxXaWR0aERpZmYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2lkdGgtZGlmZicpO1xyXG5cdFx0XHR3aGVlbEJhY2tPbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2hlZWwtYmFja3NwYWNlMCcpO1xyXG5cdFx0XHR3aGVlbEJhY2tUd28gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2hlZWwtYmFja3NwYWNlMScpO1xyXG5cdFx0XHR3aGVlbEJhY2tEaWZmID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3djLWJhY2tzcGFjZS1kaWZmJyk7XHJcblx0XHRcdHdoZWVsRnJvbnRPbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2hlZWwtZnJvbnRzcGFjZTAnKTtcclxuXHRcdFx0d2hlZWxGcm9udFR3byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy13aGVlbC1mcm9udHNwYWNlMScpO1xyXG5cdFx0XHR3aGVlbEZyb250RGlmZiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy1mcm9udHNwYWNlLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2Mtd2hlZWwtb2Zmc2V0MCcpO1xyXG5cdFx0XHR3aGVlbE9mZnNldFR3byA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy13aGVlbC1vZmZzZXQxJyk7XHJcblx0XHRcdHdoZWVsT2Zmc2V0RGlmZiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy1vZmZzZXQtZGlmZicpO1xyXG5cdFx0XHRkaWFtZXRlclNlbGVjdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcud2MtZmlyc3RpJyk7XHJcblx0XHRcdHdpZHRoU2VsZWN0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy53Yy1zZWNvbmRpJyk7XHJcblx0XHRcdG9mZnNldFNlbGVjdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcud2MtdGhpcmRpJyk7XHJcblx0XHRcdHdoZWVsRGV0U3VzcGVuc2lvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy1kZXRhaWxzLXN1c3BlbnNpb24nKTtcclxuXHRcdFx0d2hlZWxEZXRGZW5kZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3djLWRldGFpbHMtZmVuZGVycycpO1xyXG5cdFx0XHR3aGVlbERldFdoZWVsV2VsbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjd2MtZGV0YWlscy13aGVlbHdlbGxzJyk7XHJcblx0XHRcdHdoZWVsRGV0QnJha2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3djLWRldGFpbHMtYnJha2VzJyk7XHJcblx0XHRcdGNsZWFyYW5jZU5vdGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3djLWNsZWFyYW5jZS1jb250YWluZXInKTtcclxuXHRcdFx0ZGlzY2xhaW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN3Yy1kaXNjbGFpbWVyJyk7XHJcblx0XHRcdG5vdGVzV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNOb3RlcycpO1xyXG5cdFx0XHRub3Rlc1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3RlcycpO1xyXG5cdFx0XHRkaW1zV3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNEaW1lbnNpb25zJyk7XHJcblx0XHRcdGRpbXNUb2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGltcycpO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLmRpc2NsYWltZXIpe1xyXG5cdFx0XHRcdGRpc2NsYWltZXIuaW5uZXJIVE1MID0gb3B0aW9ucy5kaXNjbGFpbWVyO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRpc2NsYWltZXIuaW5uZXJIVE1MID0gXCJUaGlzIHRvb2wgaXMgZm9yIGVzdGltYXRpb24gcHVycG9zZXMgb25seS4gWW91IHNob3VsZCBjb25zdWx0IGEgcHJvZmVzc2lvbmFsIGFuZCBjb25maXJtIG1lYXN1cmVtZW50cyBwcmlvciB0byBtYWtpbmcgYW55IG1vZGlmaWNhdGlvbnMgdG8geW91ciB2ZWhpY2xlLlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRhZGRMaXN0ZW5lcnMoZGlhbWV0ZXJTZWxlY3RzLCAnY2hhbmdlJywgb25GaXJzdENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyh3aWR0aFNlbGVjdHMsICdjaGFuZ2UnLCBvblNlY29uZENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyhvZmZzZXRTZWxlY3RzLCAnY2hhbmdlJywgb25UaGlyZENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyhkaW1zVG9nZ2xlLCAnY2xpY2snLCB0b2dnbGVSZXN1bHRzKTtcclxuXHRcdFx0YWRkTGlzdGVuZXJzKG5vdGVzVG9nZ2xlLCAnY2xpY2snLCB0b2dnbGVSZXN1bHRzKTtcclxuXHJcblx0XHRcdGdldFdoZWVsRGlhbWV0ZXJzKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBnZXQgd2hlZWwgZGlhbWV0ZXJzLCBwb3B1bGF0ZSBkaWFtZXRlciBzZWxlY3RcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxEaWFtZXRlcnMoKXtcclxuXHRcdFx0bGV0IGNvdW50ID0gMTIsXHJcblx0XHRcdFx0d2hlZWxEaWFtZXRlck1heCA9IDMwLFxyXG5cdFx0XHRcdHdoZWVsRGlhbWV0ZXJzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsRGlhbWV0ZXJNYXggKyAxKXtcclxuXHRcdFx0XHR3aGVlbERpYW1ldGVycy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR3aGVlbERpYW1ldGVycy51bnNoaWZ0KFwiRGlhbWV0ZXJcIik7XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKGRpYW1ldGVyU2VsZWN0c1swXSwgd2hlZWxEaWFtZXRlcnMpXHJcblx0XHRcdHBvcHVsYXRlRmllbGQoZGlhbWV0ZXJTZWxlY3RzWzFdLCB3aGVlbERpYW1ldGVycylcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGdldCB3aGVlbCB3aWR0aHMgZ2l2ZW4gdGhlIGN1cnJlbnQgZGlhbWV0ZXIgaW5wdXQsIHBvcHVsYXRlIHdpZHRoIHNlbGVjdFxyXG5cdFx0ICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50IC0gZGlhbWV0ZXIgaW5wdXQgZWxlbWVudHNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxXaWR0aHMoZWxlbWVudCl7XHJcblx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnRhcmdldDtcclxuXHRcdFx0XHJcblx0XHRcdGxldCBuZXh0RWwgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLmNoaWxkcmVuWzBdLFxyXG5cdFx0XHRcdGNvdW50ID0gNCxcclxuXHRcdFx0XHR3aGVlbFdpZHRoTWF4ID0gMTIuNSxcclxuXHRcdFx0XHR3aGVlbFdpZHRocyA9IFtdO1xyXG5cclxuXHRcdFx0d2hpbGUoY291bnQgPCB3aGVlbFdpZHRoTWF4ICsgLjUpe1xyXG5cdFx0XHRcdHdoZWVsV2lkdGhzLnB1c2goY291bnQpO1xyXG5cdFx0XHRcdGNvdW50Kz0uNTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0d2hlZWxXaWR0aHMudW5zaGlmdChcIldpZHRoXCIpO1xyXG5cclxuXHRcdFx0cG9wdWxhdGVGaWVsZChuZXh0RWwsIHdoZWVsV2lkdGhzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGdldCB3aGVlbCBvZmZzZXRzIGdpdmVuIHRoZSBjdXJyZW50IHdpZHRoIGlucHV0LCBwb3B1bGF0ZSBvZmZzZXQgc2VsZWN0XHJcblx0XHQgKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnQgLSB3aWR0aCBpbnB1dCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFdoZWVsT2Zmc2V0cyhlbGVtZW50KXtcclxuXHRcdFx0ZWxlbWVudCA9IGVsZW1lbnQudGFyZ2V0O1xyXG5cdFx0XHRcclxuXHRcdFx0bGV0IG5leHRFbCA9IGVsZW1lbnQucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2hpbGRyZW5bMF0sXHJcblx0XHRcdFx0Y291bnQgPSAtNjUsXHJcblx0XHRcdFx0d2hlZWxPZmZldE1heCA9IDEyNSxcclxuXHRcdFx0XHR3aGVlbE9mZnNldHMgPSBbXTtcclxuXHJcblx0XHRcdHdoaWxlKGNvdW50IDwgd2hlZWxPZmZldE1heCArIDEpe1xyXG5cdFx0XHRcdHdoZWVsT2Zmc2V0cy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR3aGVlbE9mZnNldHMudW5zaGlmdChcIk9mZnNldFwiKTtcclxuXHJcblx0XHRcdHBvcHVsYXRlRmllbGQobmV4dEVsLCB3aGVlbE9mZnNldHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogcG9wdWxhdGUgc2VsZWN0IGZpZWxkcyB3aXRoIGdpdmVuIGRhdGFcclxuXHRcdCAqIEBwYXJhbSB7Tm9kZUxpc3R9IGZpZWxkIC0gZWxlbWVudCB5b3Ugd2FudCB0byBwb3B1bGF0ZVxyXG5cdFx0ICogQHBhcmFtIHthcnJheX0gZGF0YUFycmF5IC0gZGF0YSB5b3UgdG8gYWRkIHRvIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gcG9wdWxhdGVGaWVsZChmaWVsZCwgZGF0YUFycmF5KXtcclxuXHRcdFx0ZGF0YUFycmF5LmZvckVhY2goZnVuY3Rpb24oZGF0YSl7XHJcblx0XHRcdFx0bGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IGRhdGE7XHJcblx0XHRcdFx0b3B0aW9uLmlubmVySFRNTCA9IGRhdGE7XHJcblxyXG5cdFx0XHRcdGZpZWxkLmFwcGVuZENoaWxkKG9wdGlvbik7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYoZmllbGQuZGlzYWJsZWQpIGZpZWxkLmRpc2FibGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBjYWxsIHJpZGVzdHlsZXIgYXBpIHRvIGNvbXBhcmUgdHdvIGdpdmVuIHdoZWVsc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRDb21wYXJlRGF0YSgpe1xyXG5cdFx0XHRsZXQgcmVxdWVzdERhdGEgPSB7QmFzZVNpemU6d2hlZWxzWzBdLkRpYW1ldGVyICsgXCJ4XCIgKyB3aGVlbHNbMF0uV2lkdGggKyBcIiBFVFwiICsgd2hlZWxzWzBdLk9mZnNldCwgXCJOZXdTaXplc1swXVwiOndoZWVsc1sxXS5EaWFtZXRlciArIFwieFwiICsgd2hlZWxzWzFdLldpZHRoICsgXCIgRVRcIiArIHdoZWVsc1sxXS5PZmZzZXR9XHJcblxyXG5cdFx0XHRzZW5kUmVxdWVzdChcIldoZWVsL0NvbXBhcmVTaXplc1wiLCByZXF1ZXN0RGF0YSkudGhlbihmdW5jdGlvbihjb21wYXJpc29uRGF0YSl7XHJcblx0XHRcdFx0aWYoY29tcGFyaXNvbkRhdGEpe1xyXG5cdFx0XHRcdFx0ZGlzcGxheUNvbXBhcmVEYXRhKGNvbXBhcmlzb25EYXRhKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZGlzcGxheUNvbXBhcmVEYXRhKGNvbXBhcmlzb25EYXRhKXtcclxuXHRcdFx0d2hlZWxEaWFtT25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheURpYW1ldGVyKTtcclxuXHRcdFx0d2hlZWxEaWFtVHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheURpYW1ldGVyKTtcclxuXHRcdFx0d2hlZWxEaWFtRGlmZi5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkRpZmZlcmVuY2VzWzBdLkRpYW1ldGVyLlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0d2hlZWxXaWR0aE9uZS5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkJhc2VTaXplLkRpc3BsYXlXaWR0aCkudG9GaXhlZCgxKTtcclxuXHRcdFx0d2hlZWxXaWR0aFR3by5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk5ld1NpemVzWzBdLkRpc3BsYXlXaWR0aCkudG9GaXhlZCgxKTtcclxuXHRcdFx0d2hlZWxXaWR0aERpZmYuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlc1swXS5XaWR0aC5QZXJjZW50LCBcImRpZmZcIik7XHJcblx0XHRcdHdoZWVsQmFja09uZS5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkJhc2VTaXplLkRpc3BsYXlCYWNrc3BhY2luZykudG9GaXhlZCgyKTtcclxuXHRcdFx0d2hlZWxCYWNrVHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheUJhY2tzcGFjaW5nKS50b0ZpeGVkKDIpO1xyXG5cdFx0XHR3aGVlbEJhY2tEaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uQmFja3NwYWNpbmcuUGVyY2VudCwgXCJkaWZmXCIpO1xyXG5cdFx0XHR3aGVlbEZyb250T25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheUZyb250c3BhY2luZykudG9GaXhlZCgyKTtcclxuXHRcdFx0d2hlZWxGcm9udFR3by5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk5ld1NpemVzWzBdLkRpc3BsYXlGcm9udHNwYWNpbmcpLnRvRml4ZWQoMik7XHJcblx0XHRcdHdoZWVsRnJvbnREaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uRnJvbnRzcGFjaW5nLlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5CYXNlU2l6ZS5EaXNwbGF5T2Zmc2V0KTtcclxuXHRcdFx0d2hlZWxPZmZzZXRUd28uaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5OZXdTaXplc1swXS5EaXNwbGF5T2Zmc2V0KTtcclxuXHRcdFx0d2hlZWxPZmZzZXREaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uT2Zmc2V0LlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0dmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5NZXNzYWdlc1swXVswXSwgXCJtZXNzYWdlXCIsIHdoZWVsRGV0U3VzcGVuc2lvbik7XHJcblx0XHRcdHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTWVzc2FnZXNbMF1bMV0sIFwibWVzc2FnZVwiLCB3aGVlbERldEZlbmRlcnMpO1xyXG5cdFx0XHR2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk1lc3NhZ2VzWzBdWzJdLCBcIm1lc3NhZ2VcIiwgd2hlZWxEZXRXaGVlbFdlbGxzKTtcclxuXHRcdFx0dmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5NZXNzYWdlc1swXVszXSwgXCJtZXNzYWdlXCIsIHdoZWVsRGV0QnJha2VzKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIHZlcmlmeURhdGEoZGF0YSwgdHlwZSwgZWwpe1xyXG5cdFx0XHRcdGxldCByZXR1cm5EYXRhID0gZGF0YTtcclxuXHJcblx0XHRcdFx0aWYodHlwZSA9PT0gXCJkaWZmXCIpe1xyXG5cdFx0XHRcdFx0aWYoaXNOYU4ocGFyc2VJbnQocmV0dXJuRGF0YSkpID09PSBmYWxzZSl7XHJcblx0XHRcdFx0XHRcdHJldHVybkRhdGEgPSByZXR1cm5EYXRhLnRvRml4ZWQoMikgKyBcIiVcIlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSBpZih0eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG5cdFx0XHRcdFx0Y2xlYXJhbmNlTm90ZXMuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblx0XHRcdFx0XHRpZihyZXR1cm5EYXRhLlR5cGUgPT0gMSl7XHJcblx0XHRcdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3djLWVycm9yJyk7XHJcblx0XHRcdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3djLXdhcm5pbmcnKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LmFkZCgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKHJldHVybkRhdGEuVHlwZSA9PSAyKXtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2MtZXJyb3InKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKCd3Yy1lcnJvcicpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2MtZXJyb3InKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuRGF0YSA9IHJldHVybkRhdGEuTWVzc2FnZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKHJldHVybkRhdGEgIT09IHVuZGVmaW5lZCAmJiBlbCA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdHJldHVybiByZXR1cm5EYXRhO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSByZXR1cm5EYXRhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVXBkYXRlIG91ciB3aGVlbCBvYmplY3Qgd2l0aCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gRE9NIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gdXBkYXRlV2hlZWxPYmplY3QoZSl7XHJcblx0XHRcdGxldCB3aGVlbEVsZW1lbnQgPSBlLnRhcmdldCxcclxuXHRcdFx0XHR3aGVlbEluZGV4ID0gd2hlZWxFbGVtZW50LmlkLmNoYXJBdCh3aGVlbEVsZW1lbnQuaWQubGVuZ3RoIC0gMSksXHJcblx0XHRcdFx0d2hlZWxWYWx1ZSA9IHdoZWVsRWxlbWVudC52YWx1ZTtcclxuXHJcblx0XHRcdGlmKHdoZWVsRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3djLWZpcnN0aScpKXtcclxuXHRcdFx0XHR3aGVlbHNbd2hlZWxJbmRleF1bXCJEaWFtZXRlclwiXSA9IHdoZWVsVmFsdWU7XHJcblx0XHRcdH0gZWxzZSBpZih3aGVlbEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd3Yy1zZWNvbmRpJykpIHtcclxuXHRcdFx0XHR3aGVlbHNbd2hlZWxJbmRleF1bXCJXaWR0aFwiXSA9IHdoZWVsVmFsdWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiT2Zmc2V0XCJdID0gd2hlZWxWYWx1ZTtcclxuXHRcdFx0XHR3aGVlbHNbd2hlZWxJbmRleF1bXCJCYWNrc3BhY2VcIl0gPSBnZXRCYWNrc3BhY2luZyh3aGVlbHNbd2hlZWxJbmRleF1bXCJXaWR0aFwiXSwgd2hlZWxzW3doZWVsSW5kZXhdW1wiT2Zmc2V0XCJdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYod2hlZWxzWzBdLk9mZnNldCAhPT0gdW5kZWZpbmVkICYmIHdoZWVsc1sxXS5PZmZzZXQgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0Z2V0Q29tcGFyZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2VuZXJhdGUgYmFja3NwYWNpbmcgZ2l2ZW4gdGhlIHdpdGggYW5kIG9mZnNldFxyXG5cdFx0ICogQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggb2Ygd2hlZWxcclxuXHRcdCAqIEBwYXJhbSB7aW50fSBvZmZzZXQgLSBvZmZzZXQgb2Ygd2hlZWxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0QmFja3NwYWNpbmcod2lkdGgsIG9mZnNldCl7XHJcblx0XHRcdGxldCBiYWNrU3BhY2luZyxcclxuXHRcdFx0XHRvZmZzZXRJbkluY2hlcyA9IG1tVG9JbmNoZXMob2Zmc2V0KSxcclxuXHRcdFx0XHR3aGVlbENlbnRlciA9IHBhcnNlSW50KHdpZHRoIC8gMik7XHJcblxyXG5cdFx0XHRiYWNrU3BhY2luZyA9ICh3aGVlbENlbnRlciArIG9mZnNldEluSW5jaGVzKTtcclxuXHJcblx0XHRcdHJldHVybiBiYWNrU3BhY2luZztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIG1tIHRvIGluY2hlc1xyXG5cdFx0ICogQHBhcmFtIHtpbnR9IG1tIC0gbW0gbWVhc3VyZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbW1Ub0luY2hlcyhtbSkge1xyXG5cdFx0XHRsZXQgaW5jaGVzLFxyXG5cdFx0XHRcdG1tVG9JbmNoID0gMjUuNDtcclxuXHJcblx0XHRcdGluY2hlcyA9IHBhcnNlSW50KChtbSAvIG1tVG9JbmNoKS50b0ZpeGVkKDIpKTtcclxuXHJcblx0XHRcdHJldHVybiBpbmNoZXM7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZW5kIHJpZGVzdHlsZXIgYXBpIHJlcXVlc3RcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBlbmRwb2ludCAtIGVuZHBvaW50IGZvciByZXF1ZXN0XHJcblx0XHQgKiBAcGFyYW0ge29iamVjdHx8Zm9ybURhdGF9IGRhdGEgLSBkYXRhIHRvIGluY2x1ZGUgaW4gcmVxdWVzdFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzZW5kUmVxdWVzdChlbmRwb2ludCwgZGF0YSl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7XHJcblx0XHRcdFx0XHRhY3Rpb246IGVuZHBvaW50LFxyXG5cdFx0XHRcdFx0ZGF0YTogZGF0YSxcclxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbiAocmVzKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBsaXN0ZW5lciB0byBhIERPTSBFbGVtZW50XHJcblx0XHQgKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsIC0gZG9tIGVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBsaXN0ZW5lciAtIHR5cGUgb2YgZXZlbnQgbGlzdGVuZXJcclxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIC0gY2FsbGJhY2sgZnVuY3Rpb25cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYWRkTGlzdGVuZXJzKGVsLCBsaXN0ZW5lciwgY2Ipe1xyXG5cdFx0XHRpZih0eXBlb2YgZWwgPT09IFwib2JqZWN0XCIgJiYgT2JqZWN0LmtleXMoZWwpLmxlbmd0aCA+IDEgfHwgdHlwZW9mIGVsID09PSBcImFycmF5XCIpe1xyXG5cdFx0XHRcdGZvcihsZXQgZSBpbiBlbCl7XHJcblx0XHRcdFx0XHRpZih0eXBlb2YgZWxbZV0gPT0gXCJvYmplY3RcIikgZWxbZV0uYWRkRXZlbnRMaXN0ZW5lcihsaXN0ZW5lciwgY2IpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKGxpc3RlbmVyLCBjYik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGZpcnN0IHNlbGVjdCBjaGFuZ2VcclxuXHRcdCAqIEBwYXJhbSB7RE9NIEVsZW1lbnR9IGUgLSBzZWxlY3QgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBvbkZpcnN0Q2hhbmdlKGUpe1xyXG5cdFx0XHR1cGRhdGVXaGVlbE9iamVjdChlKTtcclxuXHRcdFx0Z2V0V2hlZWxXaWR0aHMoZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBzZWNvbmQgc2VsZWN0IGNoYW5nZVxyXG5cdFx0ICogQHBhcmFtIHtET00gRWxlbWVudH0gZSAtIHNlbGVjdCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uU2Vjb25kQ2hhbmdlKGUpe1xyXG5cdFx0XHR1cGRhdGVXaGVlbE9iamVjdChlKTtcclxuXHRcdFx0Z2V0V2hlZWxPZmZzZXRzKGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogdGhpcmQgc2VsZWN0IGNoYW5nZVxyXG5cdFx0ICogQHBhcmFtIHtET00gRWxlbWVudH0gZSAtIHNlbGVjdCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uVGhpcmRDaGFuZ2UoZSl7XHJcblx0XHRcdHVwZGF0ZVdoZWVsT2JqZWN0KGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRvZ2dsZVJlc3VsdHMoZSl7XHJcblx0XHRcdGlmKGUudGFyZ2V0LmlkID09IFwiZGltc1wiKSB7XHJcblx0XHRcdFx0bm90ZXNXcmFwcGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHRcdFx0XHRkaW1zV3JhcHBlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG5cdFx0XHRcdG5vdGVzVG9nZ2xlLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0ZGltc1RvZ2dsZS5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRpbXNXcmFwcGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuXHRcdFx0XHRub3Rlc1dyYXBwZXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuXHRcdFx0XHRkaW1zVG9nZ2xlLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XHJcblx0XHRcdFx0bm90ZXNUb2dnbGUuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT24gd2luZG93IGxvYWQgRE9NIGNvbnRlbnRcclxuXHRcdCAqL1xyXG5cdFx0aWYgKCFjb250YWluZXJFbGVtZW50KSB7XHJcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IFxyXG5cdFx0XHRcdGNvbnRhaW5lckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXJJZCk7XHJcblx0XHRcdFx0b25Eb21SZWFkeSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG9uRG9tUmVhZHkoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0d2luZG93LldoZWVsQ2FsY3VsYXRvciA9IFdoZWVsQ2FsY3VsYXRvcjtcclxufSkoKTtcclxuIl19
