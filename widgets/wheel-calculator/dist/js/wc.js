(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
        cdnUrl = "https://static.ridestyler.net/widgets/wheel-calculator/1.0",
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
        disclaimer;
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
      return new Promise(function (resolve) {
        var css = document.createElement('link');
        css.rel = "stylesheet";
        css.href = cssUrl;
        document.getElementsByTagName('head')[0].append(css);

        css.onload = function () {
          resolve();
        };
      });
    }
    /**
     * load tpl from cdn
     */


    function loadTpl() {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest(),
            container = document.getElementById(containerId);

        xhr.onreadystatechange = function () {
          var completed = 4;

          if (xhr.readyState === completed) {
            if (xhr.status === 200) {
              container.innerHTML = xhr.responseText;
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
      wheelDiamOne = document.getElementById('wc-wheel-diam0');
      wheelDiamTwo = document.getElementById('wc-wheel-diam1');
      wheelDiamDiff = document.getElementById('wc-diam-diff');
      wheelWidthOne = document.getElementById('wc-wheel-width0');
      wheelWidthTwo = document.getElementById('wc-wheel-width1');
      wheelWidthDiff = document.getElementById('wc-width-diff');
      wheelBackOne = document.getElementById('wc-wheel-backspace0');
      wheelBackTwo = document.getElementById('wc-wheel-backspace1');
      wheelBackDiff = document.getElementById('wc-backspace-diff');
      wheelFrontOne = document.getElementById('wc-wheel-frontspace0');
      wheelFrontTwo = document.getElementById('wc-wheel-frontspace1');
      wheelFrontDiff = document.getElementById('wc-frontspace-diff');
      wheelOffsetOne = document.getElementById('wc-wheel-offset0');
      wheelOffsetTwo = document.getElementById('wc-wheel-offset1');
      wheelOffsetDiff = document.getElementById('wc-offset-diff');
      diameterSelects = document.getElementsByClassName('wc-firsti');
      widthSelects = document.getElementsByClassName('wc-secondi');
      offsetSelects = document.getElementsByClassName('wc-thirdi');
      wheelDetSuspension = document.getElementById('wc-details-suspension');
      wheelDetFenders = document.getElementById('wc-details-fenders');
      wheelDetWheelWells = document.getElementById('wc-details-wheelwells');
      wheelDetBrakes = document.getElementById('wc-details-brakes');
      clearanceNotes = document.getElementById('wc-clearance-container');
      disclaimer = document.getElementById('wc-disclaimer');

      if (options) {
        disclaimer.innerHTML = options.disclaimer;
      } else {
        disclaimer.innerHTML = "This tool is for estimation purposes only. You should consult a professional and confirm measurements prior to making any modifications to your vehicle.";
      }

      addListeners(diameterSelects, 'change', onFirstChange);
      addListeners(widthSelects, 'change', onSecondChange);
      addListeners(offsetSelects, 'change', onThirdChange);
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
        BaseSize: wheels[0].Diameter + "x" + wheels[0].Width + "ET" + wheels[0].Offset,
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

      if (wheelValue !== isNaN) {}

      if (wheelElement.classList.contains('wc-firsti')) {
        wheels[wheelIndex]["Diameter"] = wheelValue;
      } else if (wheelElement.classList.contains('wc-secondi')) {
        wheels[wheelIndex]["Width"] = wheelValue;
      } else {
        wheels[wheelIndex]["Offset"] = wheelValue;
        wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
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
      return new Promise(function (resolve) {
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
      if (_typeof(el) === "object" || typeof el === "array") {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = el[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            e.addEventListener(listener, cb);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
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

      if (wheels[1].Offset !== undefined) {
        getCompareData();
      }
    }
    /**
     * second select change
     * @param {DOM Element} e - select element
     */


    function onSecondChange(e) {
      updateWheelObject(e);
      getWheelOffsets(e);

      if (wheels[1].Offset !== undefined) {
        getCompareData();
      }
    }
    /**
     * third select change
     * @param {DOM Element} e - select element
     */


    function onThirdChange(e) {
      updateWheelObject(e);

      if (wheels[1].Offset !== undefined) {
        getCompareData();
      }
    }
    /**
     * On window load DOM content
     */


    document.addEventListener("DOMContentLoaded", function (event) {
      onDomReady(); // initializeUi();
    });
  }

  window.WheelCalculator = WheelCalculator;
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvV2hlZWxDYWxjdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLENBQUMsWUFBWTtBQUNaOzs7Ozs7QUFNQSxXQUFTLGVBQVQsQ0FBeUIsV0FBekIsRUFBc0MsT0FBdEMsRUFBK0M7QUFDOUMsUUFBSSxlQUFKO0FBQUEsUUFDQSxZQURBO0FBQUEsUUFFQSxhQUZBO0FBQUEsUUFHQSxNQUFNLEdBQUcsQ0FBQztBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBRCxFQUErRTtBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBL0UsQ0FIVDtBQUFBLFFBSUEsTUFBTSxHQUFHLDREQUpUO0FBQUEsUUFLQSxNQUFNLEdBQUcsTUFBTSxHQUFHLGNBTGxCO0FBQUEsUUFNQSxNQUFNLEdBQUcsTUFBTSxHQUFHLGlCQU5sQjtBQUFBLFFBT0EsWUFQQTtBQUFBLFFBUUEsWUFSQTtBQUFBLFFBU0EsYUFUQTtBQUFBLFFBVUEsYUFWQTtBQUFBLFFBV0EsYUFYQTtBQUFBLFFBWUEsY0FaQTtBQUFBLFFBYUEsWUFiQTtBQUFBLFFBY0EsWUFkQTtBQUFBLFFBZUEsYUFmQTtBQUFBLFFBZ0JBLGFBaEJBO0FBQUEsUUFpQkEsYUFqQkE7QUFBQSxRQWtCQSxjQWxCQTtBQUFBLFFBbUJBLGNBbkJBO0FBQUEsUUFvQkEsY0FwQkE7QUFBQSxRQXFCQSxlQXJCQTtBQUFBLFFBc0JBLGtCQXRCQTtBQUFBLFFBdUJBLGVBdkJBO0FBQUEsUUF3QkEsa0JBeEJBO0FBQUEsUUF5QkEs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QU0sQ0FBQyxDQUFELENBQU4sQ0FBVSxNQUFWLEtBQXFCLFNBQXhCLEVBQWtDO0FBQ2pDLFFBQUEsY0FBYztBQUNkO0FBQ0Q7QUFFRDs7Ozs7O0FBSUEsYUFBUyxhQUFULENBQXVCLENBQXZCLEVBQXlCO0FBQ3hCLE1BQUEsaUJBQWlCLENBQUMsQ0FBRCxDQUFqQjs7QUFDQSxVQUFHLE1BQU0sQ0FBQyxDQUFELENBQU4sQ0FBVSxNQUFWLEtBQXFCLFNBQXhCLEVBQWtDO0FBQ2pDLFFBQUEsY0FBYztBQUNkO0FBQ0Q7QUFFRDs7Ozs7QUFHQSxJQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsVUFBUyxLQUFULEVBQWdCO0FBQzdELE1BQUEsVUFBVSxHQURtRCxDQUU3RDtBQUNBLEtBSEQ7QUFJQTs7QUFDRCxFQUFBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLGVBQXpCO0FBQ0EsQ0FsWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKCkge1xyXG5cdC8qKlxyXG5cdCAqIFdoZWVsQ2FsY3VsYXRvcjogUmVuZGVyIHRoZSBXaGVlbCBDYWxjdWxhdG9yIHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFdoZWVsQ2FsY3VsYXRvcihjb250YWluZXJJZCwgb3B0aW9ucykge1xyXG5cdFx0bGV0IGRpYW1ldGVyU2VsZWN0cyxcclxuXHRcdHdpZHRoU2VsZWN0cyxcclxuXHRcdG9mZnNldFNlbGVjdHMsXHJcblx0XHR3aGVlbHMgPSBbe0RpYW1ldGVyOnVuZGVmaW5lZCwgV2lkdGg6dW5kZWZpbmVkLCBPZmZzZXQ6dW5kZWZpbmVkLCBCYWNrc3BhY2U6dW5kZWZpbmVkfSwge0RpYW1ldGVyOnVuZGVmaW5lZCwgV2lkdGg6dW5kZWZpbmVkLCBPZmZzZXQ6dW5kZWZpbmVkLCBCYWNrc3BhY2U6dW5kZWZpbmVkfV0sXHJcblx0XHRjZG5VcmwgPSBcImh0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIubmV0L3dpZGdldHMvd2hlZWwtY2FsY3VsYXRvci8xLjBcIixcclxuXHRcdHRwbFVybCA9IGNkblVybCArIFwiL2h0bWwvd2MudHBsXCIsXHJcblx0XHRjc3NVcmwgPSBjZG5VcmwgKyBcIi9jc3Mvd2MubWluLmNzc1wiLFxyXG5cdFx0d2hlZWxEaWFtT25lLFxyXG5cdFx0d2hlZWxEaWFtVHdvLFxyXG5cdFx0d2hlZWxEaWFtRGlmZixcclxuXHRcdHdoZWVsV2lkdGhPbmUsXHJcblx0XHR3aGVlbFdpZHRoVHdvLFxyXG5cdFx0d2hlZWxXaWR0aERpZmYsXHJcblx0XHR3aGVlbEJhY2tPbmUsXHJcblx0XHR3aGVlbEJhY2tUd28sXHJcblx0XHR3aGVlbEJhY2tEaWZmLFxyXG5cdFx0d2hlZWxGcm9udE9uZSxcclxuXHRcdHdoZWVsRnJvbnRUd28sXHJcblx0XHR3aGVlbEZyb250RGlmZixcclxuXHRcdHdoZWVsT2Zmc2V0T25lLFxyXG5cdFx0d2hlZWxPZmZzZXRUd28sXHJcblx0XHR3aGVlbE9mZnNldERpZmYsXHJcblx0XHR3aGVlbERldFN1c3BlbnNpb24sXHJcblx0XHR3aGVlbERldEZlbmRlcnMsXHJcblx0XHR3aGVlbERldFdoZWVsV2VsbHMsXHJcblx0XHR3aGVlbERldEJyYWtlcyxcclxuXHRcdGNsZWFyYW5jZU5vdGVzLFxyXG5cdFx0ZGlzY2xhaW1lcjtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJ1bnMgd2hlbiBET00gY29udGVudCBsb2FkZWQuIExvYWQgcmVzb3VyY2VzLCB0aGVuIGluaXRpYWxpemUgVUkuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uRG9tUmVhZHkoKXtcclxuXHRcdFx0bG9hZFN0eWxlcygpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRsb2FkVHBsKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0aW5pdGlhbGl6ZVVpKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbG9hZCBzdHlsZXNoZWV0IGZyb20gY2RuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRTdHlsZXMoKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdGxldCBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0XHRcdFx0Y3NzLnJlbCA9IFwic3R5bGVzaGVldFwiO1xyXG5cdFx0XHRcdGNzcy5ocmVmID0gY3NzVXJsO1xyXG5cdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kKGNzcyk7XHJcblxyXG5cdFx0XHRcdGNzcy5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBsb2FkIHRwbCBmcm9tIGNkblxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkVHBsKCl7IFxyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0bGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxyXG5cdFx0XHRcdGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcklkKTtcclxuXHRcclxuXHRcdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIgY29tcGxldGVkID0gNDtcclxuXHRcdFxyXG5cdFx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBjb21wbGV0ZWQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd0ZW1wbGF0ZSBmYWlsZWQgdG8gbG9hZCcpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0XHRcdHhoci5vcGVuKCdHRVQnLCB0cGxVcmwsIHRydWUpO1xyXG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGluaXRpYWxpemUgdWkgZm9yIHRlbXBsYXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVVaSgpe1xyXG5cdFx0XHR3aGVlbERpYW1PbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtZGlhbTAnKTtcclxuXHRcdFx0d2hlZWxEaWFtVHdvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLWRpYW0xJyk7XHJcblx0XHRcdHdoZWVsRGlhbURpZmYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtZGlhbS1kaWZmJyk7XHJcblx0XHRcdHdoZWVsV2lkdGhPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtd2lkdGgwJyk7XHJcblx0XHRcdHdoZWVsV2lkdGhUd28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtd2lkdGgxJyk7XHJcblx0XHRcdHdoZWVsV2lkdGhEaWZmID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdpZHRoLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxCYWNrT25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLWJhY2tzcGFjZTAnKTtcclxuXHRcdFx0d2hlZWxCYWNrVHdvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLWJhY2tzcGFjZTEnKTtcclxuXHRcdFx0d2hlZWxCYWNrRGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1iYWNrc3BhY2UtZGlmZicpO1xyXG5cdFx0XHR3aGVlbEZyb250T25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLWZyb250c3BhY2UwJyk7XHJcblx0XHRcdHdoZWVsRnJvbnRUd28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtZnJvbnRzcGFjZTEnKTtcclxuXHRcdFx0d2hlZWxGcm9udERpZmYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtZnJvbnRzcGFjZS1kaWZmJyk7XHJcblx0XHRcdHdoZWVsT2Zmc2V0T25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLW9mZnNldDAnKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRUd28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtb2Zmc2V0MScpO1xyXG5cdFx0XHR3aGVlbE9mZnNldERpZmYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtb2Zmc2V0LWRpZmYnKTtcclxuXHRcdFx0ZGlhbWV0ZXJTZWxlY3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2MtZmlyc3RpJyk7XHJcblx0XHRcdHdpZHRoU2VsZWN0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3djLXNlY29uZGknKTtcclxuXHRcdFx0b2Zmc2V0U2VsZWN0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3djLXRoaXJkaScpO1xyXG5cdFx0XHR3aGVlbERldFN1c3BlbnNpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtZGV0YWlscy1zdXNwZW5zaW9uJyk7XHJcblx0XHRcdHdoZWVsRGV0RmVuZGVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1kZXRhaWxzLWZlbmRlcnMnKTtcclxuXHRcdFx0d2hlZWxEZXRXaGVlbFdlbGxzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWRldGFpbHMtd2hlZWx3ZWxscycpO1xyXG5cdFx0XHR3aGVlbERldEJyYWtlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1kZXRhaWxzLWJyYWtlcycpO1xyXG5cdFx0XHRjbGVhcmFuY2VOb3RlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1jbGVhcmFuY2UtY29udGFpbmVyJyk7XHJcblx0XHRcdGRpc2NsYWltZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtZGlzY2xhaW1lcicpOyBcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMpe1xyXG5cdFx0XHRcdGRpc2NsYWltZXIuaW5uZXJIVE1MID0gb3B0aW9ucy5kaXNjbGFpbWVyO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRpc2NsYWltZXIuaW5uZXJIVE1MID0gXCJUaGlzIHRvb2wgaXMgZm9yIGVzdGltYXRpb24gcHVycG9zZXMgb25seS4gWW91IHNob3VsZCBjb25zdWx0IGEgcHJvZmVzc2lvbmFsIGFuZCBjb25maXJtIG1lYXN1cmVtZW50cyBwcmlvciB0byBtYWtpbmcgYW55IG1vZGlmaWNhdGlvbnMgdG8geW91ciB2ZWhpY2xlLlwiO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRhZGRMaXN0ZW5lcnMoZGlhbWV0ZXJTZWxlY3RzLCAnY2hhbmdlJywgb25GaXJzdENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyh3aWR0aFNlbGVjdHMsICdjaGFuZ2UnLCBvblNlY29uZENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyhvZmZzZXRTZWxlY3RzLCAnY2hhbmdlJywgb25UaGlyZENoYW5nZSk7XHJcblxyXG5cdFx0XHRnZXRXaGVlbERpYW1ldGVycygpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogZ2V0IHdoZWVsIGRpYW1ldGVycywgcG9wdWxhdGUgZGlhbWV0ZXIgc2VsZWN0XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFdoZWVsRGlhbWV0ZXJzKCl7XHJcblx0XHRcdGxldCBjb3VudCA9IDEyLFxyXG5cdFx0XHR3aGVlbERpYW1ldGVyTWF4ID0gMzAsXHJcblx0XHRcdHdoZWVsRGlhbWV0ZXJzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsRGlhbWV0ZXJNYXggKyAxKXtcclxuXHRcdFx0XHR3aGVlbERpYW1ldGVycy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR3aGVlbERpYW1ldGVycy51bnNoaWZ0KFwiRGlhbWV0ZXJcIik7XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKGRpYW1ldGVyU2VsZWN0c1swXSwgd2hlZWxEaWFtZXRlcnMpXHJcblx0XHRcdHBvcHVsYXRlRmllbGQoZGlhbWV0ZXJTZWxlY3RzWzFdLCB3aGVlbERpYW1ldGVycylcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGdldCB3aGVlbCB3aWR0aHMgZ2l2ZW4gdGhlIGN1cnJlbnQgZGlhbWV0ZXIgaW5wdXQsIHBvcHVsYXRlIHdpZHRoIHNlbGVjdFxyXG5cdFx0ICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50IC0gZGlhbWV0ZXIgaW5wdXQgZWxlbWVudHNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxXaWR0aHMoZWxlbWVudCl7XHJcblx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnRhcmdldDtcclxuXHRcdFx0bGV0IG5leHRFbCA9IGVsZW1lbnQucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2hpbGRyZW5bMF0sXHJcblx0XHRcdGNvdW50ID0gNCxcclxuXHRcdFx0d2hlZWxXaWR0aE1heCA9IDEyLjUsXHJcblx0XHRcdHdoZWVsV2lkdGhzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsV2lkdGhNYXggKyAuNSl7XHJcblx0XHRcdFx0d2hlZWxXaWR0aHMucHVzaChjb3VudCk7XHJcblx0XHRcdFx0Y291bnQrPS41O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR3aGVlbFdpZHRocy51bnNoaWZ0KFwiV2lkdGhcIik7XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKG5leHRFbCwgd2hlZWxXaWR0aHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogZ2V0IHdoZWVsIG9mZnNldHMgZ2l2ZW4gdGhlIGN1cnJlbnQgd2lkdGggaW5wdXQsIHBvcHVsYXRlIG9mZnNldCBzZWxlY3RcclxuXHRcdCAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudCAtIHdpZHRoIGlucHV0IGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxPZmZzZXRzKGVsZW1lbnQpe1xyXG5cdFx0XHRlbGVtZW50ID0gZWxlbWVudC50YXJnZXQ7XHJcblx0XHRcdGxldCBuZXh0RWwgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLmNoaWxkcmVuWzBdLFxyXG5cdFx0XHRjb3VudCA9IC02NSxcclxuXHRcdFx0d2hlZWxPZmZldE1heCA9IDEyNSxcclxuXHRcdFx0d2hlZWxPZmZzZXRzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsT2ZmZXRNYXggKyAxKXtcclxuXHRcdFx0XHR3aGVlbE9mZnNldHMucHVzaChjb3VudCk7XHJcblx0XHRcdFx0Y291bnQrKztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0d2hlZWxPZmZzZXRzLnVuc2hpZnQoXCJPZmZzZXRcIik7XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKG5leHRFbCwgd2hlZWxPZmZzZXRzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHBvcHVsYXRlIHNlbGVjdCBmaWVsZHMgd2l0aCBnaXZlbiBkYXRhXHJcblx0XHQgKiBAcGFyYW0ge05vZGVMaXN0fSBmaWVsZCAtIGVsZW1lbnQgeW91IHdhbnQgdG8gcG9wdWxhdGVcclxuXHRcdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJheSAtIGRhdGEgeW91IHRvIGFkZCB0byBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlRmllbGQoZmllbGQsIGRhdGFBcnJheSl7XHJcblx0XHRcdGRhdGFBcnJheS5mb3JFYWNoKGRhdGEgPT4ge1xyXG5cdFx0XHRcdGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRvcHRpb24udmFsdWUgPSBkYXRhO1xyXG5cdFx0XHRcdG9wdGlvbi5pbm5lckhUTUwgPSBkYXRhO1xyXG5cclxuXHRcdFx0XHRmaWVsZC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmKGZpZWxkLmRpc2FibGVkKSBmaWVsZC5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogY2FsbCByaWRlc3R5bGVyIGFwaSB0byBjb21wYXJlIHR3byBnaXZlbiB3aGVlbHNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0Q29tcGFyZURhdGEoKXtcclxuXHRcdFx0bGV0IHJlcXVlc3REYXRhID0ge0Jhc2VTaXplOndoZWVsc1swXS5EaWFtZXRlciArIFwieFwiICsgd2hlZWxzWzBdLldpZHRoICsgXCJFVFwiICsgd2hlZWxzWzBdLk9mZnNldCwgXCJOZXdTaXplc1swXVwiOndoZWVsc1sxXS5EaWFtZXRlciArIFwieFwiICsgd2hlZWxzWzFdLldpZHRoICsgXCIgRVRcIiArIHdoZWVsc1sxXS5PZmZzZXR9XHJcblxyXG5cdFx0XHRzZW5kUmVxdWVzdChcIldoZWVsL0NvbXBhcmVTaXplc1wiLCByZXF1ZXN0RGF0YSkudGhlbihmdW5jdGlvbihjb21wYXJpc29uRGF0YSl7XHJcblx0XHRcdFx0aWYoY29tcGFyaXNvbkRhdGEpe1xyXG5cdFx0XHRcdFx0ZGlzcGxheUNvbXBhcmVEYXRhKGNvbXBhcmlzb25EYXRhKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZGlzcGxheUNvbXBhcmVEYXRhKGNvbXBhcmlzb25EYXRhKXtcclxuXHRcdFx0d2hlZWxEaWFtT25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheURpYW1ldGVyKTtcclxuXHRcdFx0d2hlZWxEaWFtVHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheURpYW1ldGVyKTtcclxuXHRcdFx0d2hlZWxEaWFtRGlmZi5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkRpZmZlcmVuY2VzWzBdLkRpYW1ldGVyLlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0d2hlZWxXaWR0aE9uZS5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkJhc2VTaXplLkRpc3BsYXlXaWR0aCkudG9GaXhlZCgxKTtcclxuXHRcdFx0d2hlZWxXaWR0aFR3by5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk5ld1NpemVzWzBdLkRpc3BsYXlXaWR0aCkudG9GaXhlZCgxKTtcclxuXHRcdFx0d2hlZWxXaWR0aERpZmYuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlc1swXS5XaWR0aC5QZXJjZW50LCBcImRpZmZcIik7XHJcblx0XHRcdHdoZWVsQmFja09uZS5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkJhc2VTaXplLkRpc3BsYXlCYWNrc3BhY2luZykudG9GaXhlZCgyKTtcclxuXHRcdFx0d2hlZWxCYWNrVHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheUJhY2tzcGFjaW5nKS50b0ZpeGVkKDIpO1xyXG5cdFx0XHR3aGVlbEJhY2tEaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uQmFja3NwYWNpbmcuUGVyY2VudCwgXCJkaWZmXCIpO1xyXG5cdFx0XHR3aGVlbEZyb250T25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheUZyb250c3BhY2luZykudG9GaXhlZCgyKTtcclxuXHRcdFx0d2hlZWxGcm9udFR3by5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk5ld1NpemVzWzBdLkRpc3BsYXlGcm9udHNwYWNpbmcpLnRvRml4ZWQoMik7XHJcblx0XHRcdHdoZWVsRnJvbnREaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uRnJvbnRzcGFjaW5nLlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5CYXNlU2l6ZS5EaXNwbGF5T2Zmc2V0KTtcclxuXHRcdFx0d2hlZWxPZmZzZXRUd28uaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5OZXdTaXplc1swXS5EaXNwbGF5T2Zmc2V0KTtcclxuXHRcdFx0d2hlZWxPZmZzZXREaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uT2Zmc2V0LlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0dmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5NZXNzYWdlc1swXVswXSwgXCJtZXNzYWdlXCIsIHdoZWVsRGV0U3VzcGVuc2lvbik7XHJcblx0XHRcdHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTWVzc2FnZXNbMF1bMV0sIFwibWVzc2FnZVwiLCB3aGVlbERldEZlbmRlcnMpO1xyXG5cdFx0XHR2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk1lc3NhZ2VzWzBdWzJdLCBcIm1lc3NhZ2VcIiwgd2hlZWxEZXRXaGVlbFdlbGxzKTtcclxuXHRcdFx0dmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5NZXNzYWdlc1swXVszXSwgXCJtZXNzYWdlXCIsIHdoZWVsRGV0QnJha2VzKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIHZlcmlmeURhdGEoZGF0YSwgdHlwZSwgZWwpe1xyXG5cdFx0XHRcdGxldCByZXR1cm5EYXRhID0gZGF0YTtcclxuXHJcblx0XHRcdFx0aWYodHlwZSA9PT0gXCJkaWZmXCIpe1xyXG5cdFx0XHRcdFx0aWYoaXNOYU4ocGFyc2VJbnQocmV0dXJuRGF0YSkpID09PSBmYWxzZSl7XHJcblx0XHRcdFx0XHRcdHJldHVybkRhdGEgPSByZXR1cm5EYXRhLnRvRml4ZWQoMikgKyBcIiVcIlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSBpZih0eXBlID09PSBcIm1lc3NhZ2VcIikge1xyXG5cdFx0XHRcdFx0Y2xlYXJhbmNlTm90ZXMuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcblx0XHRcdFx0XHRpZihyZXR1cm5EYXRhLlR5cGUgPT0gMSl7XHJcblx0XHRcdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3djLWVycm9yJyk7XHJcblx0XHRcdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3djLXdhcm5pbmcnKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LmFkZCgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKHJldHVybkRhdGEuVHlwZSA9PSAyKXtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2MtZXJyb3InKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKCd3Yy1lcnJvcicpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2MtZXJyb3InKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuRGF0YSA9IHJldHVybkRhdGEuTWVzc2FnZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmKHJldHVybkRhdGEgIT09IHVuZGVmaW5lZCAmJiBlbCA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRcdHJldHVybiByZXR1cm5EYXRhO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihlbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRlbC5pbm5lckhUTUwgPSByZXR1cm5EYXRhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVXBkYXRlIG91ciB3aGVlbCBvYmplY3Qgd2l0aCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gRE9NIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gdXBkYXRlV2hlZWxPYmplY3QoZSl7XHJcblx0XHRcdGxldCB3aGVlbEVsZW1lbnQgPSBlLnRhcmdldCxcclxuXHRcdFx0d2hlZWxJbmRleCA9IHdoZWVsRWxlbWVudC5pZC5jaGFyQXQod2hlZWxFbGVtZW50LmlkLmxlbmd0aCAtIDEpLFxyXG5cdFx0XHR3aGVlbFZhbHVlID0gd2hlZWxFbGVtZW50LnZhbHVlO1xyXG5cclxuXHRcdFx0aWYod2hlZWxWYWx1ZSAhPT0gaXNOYU4pe31cclxuXHRcdFx0aWYod2hlZWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnd2MtZmlyc3RpJykpe1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIkRpYW1ldGVyXCJdID0gd2hlZWxWYWx1ZTtcclxuXHRcdFx0fSBlbHNlIGlmKHdoZWVsRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3djLXNlY29uZGknKSkge1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIldpZHRoXCJdID0gd2hlZWxWYWx1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR3aGVlbHNbd2hlZWxJbmRleF1bXCJPZmZzZXRcIl0gPSB3aGVlbFZhbHVlO1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIkJhY2tzcGFjZVwiXSA9IGdldEJhY2tzcGFjaW5nKHdoZWVsc1t3aGVlbEluZGV4XVtcIldpZHRoXCJdLCB3aGVlbHNbd2hlZWxJbmRleF1bXCJPZmZzZXRcIl0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZW5lcmF0ZSBiYWNrc3BhY2luZyBnaXZlbiB0aGUgd2l0aCBhbmQgb2Zmc2V0XHJcblx0XHQgKiBAcGFyYW0ge2ludH0gd2lkdGggLSB3aWR0aCBvZiB3aGVlbFxyXG5cdFx0ICogQHBhcmFtIHtpbnR9IG9mZnNldCAtIG9mZnNldCBvZiB3aGVlbFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRCYWNrc3BhY2luZyh3aWR0aCwgb2Zmc2V0KXtcclxuXHRcdFx0bGV0IGJhY2tTcGFjaW5nLFxyXG5cdFx0XHRvZmZzZXRJbkluY2hlcyA9IG1tVG9JbmNoZXMob2Zmc2V0KSxcclxuXHRcdFx0d2hlZWxDZW50ZXIgPSBwYXJzZUludCh3aWR0aCAvIDIpO1xyXG5cclxuXHRcdFx0YmFja1NwYWNpbmcgPSAod2hlZWxDZW50ZXIgKyBvZmZzZXRJbkluY2hlcyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gYmFja1NwYWNpbmc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBtbSB0byBpbmNoZXNcclxuXHRcdCAqIEBwYXJhbSB7aW50fSBtbSAtIG1tIG1lYXN1cmVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG1tVG9JbmNoZXMobW0pIHtcclxuXHRcdFx0bGV0IGluY2hlcyxcclxuXHRcdFx0bW1Ub0luY2ggPSAyNS40O1xyXG5cclxuXHRcdFx0aW5jaGVzID0gcGFyc2VJbnQoKG1tIC8gbW1Ub0luY2gpLnRvRml4ZWQoMikpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGluY2hlcztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNlbmQgcmlkZXN0eWxlciBhcGkgcmVxdWVzdFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGVuZHBvaW50IC0gZW5kcG9pbnQgZm9yIHJlcXVlc3RcclxuXHRcdCAqIEBwYXJhbSB7b2JqZWN0fHxmb3JtRGF0YX0gZGF0YSAtIGRhdGEgdG8gaW5jbHVkZSBpbiByZXF1ZXN0XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNlbmRSZXF1ZXN0KGVuZHBvaW50LCBkYXRhKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHtcclxuXHRcdFx0XHRcdGFjdGlvbjogZW5kcG9pbnQsXHJcblx0XHRcdFx0XHRkYXRhOiBkYXRhLFxyXG5cdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uIChyZXMpIHtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZShyZXMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGxpc3RlbmVyIHRvIGEgRE9NIEVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWwgLSBkb20gZWxlbWVudFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGxpc3RlbmVyIC0gdHlwZSBvZiBldmVudCBsaXN0ZW5lclxyXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgLSBjYWxsYmFjayBmdW5jdGlvblxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoZWwsIGxpc3RlbmVyLCBjYil7XHJcblx0XHRcdGlmKHR5cGVvZiBlbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZWwgPT09IFwiYXJyYXlcIil7XHJcblx0XHRcdFx0Zm9yKGxldCBlIG9mIGVsKXtcclxuXHRcdFx0XHRcdGUuYWRkRXZlbnRMaXN0ZW5lcihsaXN0ZW5lciwgY2IpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKGxpc3RlbmVyLCBjYik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGZpcnN0IHNlbGVjdCBjaGFuZ2VcclxuXHRcdCAqIEBwYXJhbSB7RE9NIEVsZW1lbnR9IGUgLSBzZWxlY3QgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBvbkZpcnN0Q2hhbmdlKGUpe1xyXG5cdFx0XHR1cGRhdGVXaGVlbE9iamVjdChlKTtcclxuXHRcdFx0Z2V0V2hlZWxXaWR0aHMoZSk7XHJcblx0XHRcdGlmKHdoZWVsc1sxXS5PZmZzZXQgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0Z2V0Q29tcGFyZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogc2Vjb25kIHNlbGVjdCBjaGFuZ2VcclxuXHRcdCAqIEBwYXJhbSB7RE9NIEVsZW1lbnR9IGUgLSBzZWxlY3QgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBvblNlY29uZENoYW5nZShlKXtcclxuXHRcdFx0dXBkYXRlV2hlZWxPYmplY3QoZSk7XHJcblx0XHRcdGdldFdoZWVsT2Zmc2V0cyhlKTtcclxuXHRcdFx0aWYod2hlZWxzWzFdLk9mZnNldCAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRnZXRDb21wYXJlRGF0YSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiB0aGlyZCBzZWxlY3QgY2hhbmdlXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gc2VsZWN0IGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gb25UaGlyZENoYW5nZShlKXtcclxuXHRcdFx0dXBkYXRlV2hlZWxPYmplY3QoZSk7XHJcblx0XHRcdGlmKHdoZWVsc1sxXS5PZmZzZXQgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0Z2V0Q29tcGFyZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT24gd2luZG93IGxvYWQgRE9NIGNvbnRlbnRcclxuXHRcdCAqL1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHRcdG9uRG9tUmVhZHkoKTtcclxuXHRcdFx0Ly8gaW5pdGlhbGl6ZVVpKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0d2luZG93LldoZWVsQ2FsY3VsYXRvciA9IFdoZWVsQ2FsY3VsYXRvcjtcclxufSkoKTtcclxuIl19
