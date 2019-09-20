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
        isWheelsConfirmed = false,
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
        wheelOffsetOne,
        wheelOffsetTwo,
        wheelOffsetDiff;
    /**
     * Runs when DOM content loaded. Load resources, then initialize UI.
     */

    function onDomReady() {
      Promise.all([loadTpl, loadStyles]).then(function () {
        initializeUi();
      });
    }
    /**
     * load stylesheet from cdn
     */


    var loadStyles = new Promise(function (resolve) {
      var css = document.createElement('link');
      css.rel = "stylesheet";
      css.href = cssUrl;
      document.getElementsByTagName('head')[0].append(css);

      css.onload = function () {
        resolve();
      };
    });
    /**
     * load tpl from cdn
     */

    var loadTpl = new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();

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
      wheelOffsetOne = document.getElementById('wc-wheel-offset0');
      wheelOffsetTwo = document.getElementById('wc-wheel-offset0');
      wheelOffsetDiff = document.getElementById('wc-offset-diff');
      diameterSelects = document.getElementsByClassName('wc-firsti');
      widthSelects = document.getElementsByClassName('wc-secondi');
      offsetSelects = document.getElementsByClassName('wc-thirdi');
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

      populateField(nextEl, wheelOffsets);
    }
    /**
     * call ridestyler api to compare two given wheels
     */


    function getCompareData() {
      sendRequest("Wheel/CompareWheels", "Comparison", {
        BaseWheel: wheel[0],
        NewWheel: wheel[1]
      }).then(function (comparisonData) {
        wheelDiamOne.innerHTML = comparisonData.BaseWheel.Diameter;
        wheelDiamTwo.innerHTML = comparisonData.NewWheel.Diameter;
        wheelDiamDiff.innerHTML = comparisonData.Differences.OutsideDiameter;
        wheelWidthOne.innerHTML = comparisonData.BaseWheel.Width;
        wheelWidthTwo.innerHTML = comparisonData.NewWheel.Width;
        wheelWidthDiff.innerHTML = comparisonData.Differences.Width;
        wheelBackOne.innerHTML = comparisonData.BaseWheel.Back;
        wheelBackTwo.innerHTML = comparisonData.NewWheel.Back;
        wheelBackDiff.innerHTML = comparisonData.Differences.BackSpacing;
        wheelOffsetOne.innerHTML = comparisonData.BaseWheel.Offset;
        wheelOffsetTwo.innerHTML = comparisonData.NewWheel.Offset;
        wheelOffsetDiff.innerHTML = comparisonData.Differences.Offset;
      });
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
     * Update our wheel object with new values
     * @param {DOM Element} e - DOM element
     */


    function updateWheelObject(e) {
      var wheelElement = e.target,
          wheelIndex = wheelElement.id.charAt(wheelElement.id.length - 1);

      if (wheelElement.classList.contains('wc-firsti')) {
        wheels[wheelIndex]["Diameter"] = wheelElement.value;
      } else if (wheelElement.classList.contains('wc-secondi')) {
        wheels[wheelIndex]["Width"] = wheelElement.value;
      } else {
        wheels[wheelIndex]["Offset"] = wheelElement.value;
        wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
      }

      if (wheels[0].Offset !== undefined && wheels[1].Offset !== undefined) {
        isWheelsConfirmed = true;
      }
    }
    /**
     * Display wheel data given the dom element with new value
     * @param {object} wheelData - Object of new wheel data
     */


    function displayWheelData(wheelData) {}
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
     * @param {string} getter - property you want to grab from result
     * @param {object||formData} data - data to include in request
     */


    function sendRequest(endpoint, getter, data) {
      return new Promise(function (resolve) {
        ridestyler.ajax.send({
          action: endpoint,
          data: data,
          callback: function callback(res) {
            resolve(res[getter]);
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
      getCompareData();
    }
    /**
     * second select change
     * @param {DOM Element} e - select element
     */


    function onSecondChange(e) {
      updateWheelObject(e);
      getWheelOffsets(e);
      getCompareData();
    }
    /**
     * third select change
     * @param {DOM Element} e - select element
     */


    function onThirdChange(e) {
      updateWheelObject(e);
      displayWheelData(e);
      getCompareData();

      if (isWheelsConfirmed) {// displayDifferences();
        // generateDifferenceData();
      }
    }
    /**
     * On window load DOM content
     */


    window.addEventListener('DOMContentLoaded', function () {
      onDomReady(); // initializeUi();
    });
  }

  window.WheelCalculator = WheelCalculator;
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvV2hlZWxDYWxjdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLENBQUMsWUFBWTtBQUNaOzs7Ozs7QUFNQSxXQUFTLGVBQVQsQ0FBeUIsV0FBekIsRUFBc0MsT0FBdEMsRUFBK0M7QUFDOUMsUUFBSSxlQUFKO0FBQUEsUUFDQSxZQURBO0FBQUEsUUFFQSxhQUZBO0FBQUEsUUFHQSxNQUFNLEdBQUcsQ0FBQztBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBRCxFQUErRTtBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBL0UsQ0FIVDtBQUFBLFFBSUEsaUJBQWlCLEdBQUcsS0FKcEI7QUFBQSxRQUtBLE1BQU0sR0FBRyw0REFMVDtBQUFBLFFBTUEsTUFBTSxHQUFHLE1BQU0sR0FBRyxjQU5sQjtBQUFBLFFBT0EsTUFBTSxHQUFHLE1BQU0sR0FBRyxpQkFQbEI7QUFBQSxRQVFBLFlBUkE7QUFBQSxRQVNBLFlBVEE7QUFBQSxRQVVBLGFBVkE7QUFBQSxRQVdBLGFBWEE7QUFBQSxRQVlBLGFBWkE7QUFBQSxRQWFBLGNBYkE7QUFBQSxRQWNBLFlBZEE7QUFBQSxRQWVBLFlBZkE7QUFBQSxRQWdCQSxhQWhCQTtBQUFBLFFBaUJBLGNBakJBO0FBQUEsUUFrQkEsY0FsQkE7QUFBQSxRQW1CQSxlQW5CQTtBQXFCQTs7OztBQUdBLGFBQVMsVUFBVCxHQUFxQjtBQUNwQixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxPQUFELEVBQVUsVUFBVixDQUFa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RUFBeUI7QUFDeEIsTUFBQSxpQkFBaUIsQ0FBQyxDQUFELENBQWpCO0FBQ0EsTUFBQSxjQUFjLENBQUMsQ0FBRCxDQUFkO0FBQ0EsTUFBQSxjQUFjO0FBQ2Q7QUFFRDs7Ozs7O0FBSUEsYUFBUyxjQUFULENBQXdCLENBQXhCLEVBQTBCO0FBQ3pCLE1BQUEsaUJBQWlCLENBQUMsQ0FBRCxDQUFqQjtBQUNBLE1BQUEsZUFBZSxDQUFDLENBQUQsQ0FBZjtBQUNBLE1BQUEsY0FBYztBQUNkO0FBRUQ7Ozs7OztBQUlBLGFBQVMsYUFBVCxDQUF1QixDQUF2QixFQUF5QjtBQUN4QixNQUFBLGlCQUFpQixDQUFDLENBQUQsQ0FBakI7QUFDQSxNQUFBLGdCQUFnQixDQUFDLENBQUQsQ0FBaEI7QUFDQSxNQUFBLGNBQWM7O0FBRWQsVUFBRyxpQkFBSCxFQUFxQixDQUNwQjtBQUNBO0FBQ0E7QUFDRDtBQUVEOzs7OztBQUdBLElBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxZQUFVO0FBQ3JELE1BQUEsVUFBVSxHQUQyQyxDQUVyRDtBQUNBLEtBSEQ7QUFJQTs7QUFDRCxFQUFBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLGVBQXpCO0FBQ0EsQ0EzVUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKCkge1xyXG5cdC8qKlxyXG5cdCAqIFdoZWVsQ2FsY3VsYXRvcjogUmVuZGVyIHRoZSBXaGVlbCBDYWxjdWxhdG9yIHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFdoZWVsQ2FsY3VsYXRvcihjb250YWluZXJJZCwgb3B0aW9ucykge1xyXG5cdFx0bGV0IGRpYW1ldGVyU2VsZWN0cyxcclxuXHRcdHdpZHRoU2VsZWN0cyxcclxuXHRcdG9mZnNldFNlbGVjdHMsXHJcblx0XHR3aGVlbHMgPSBbe0RpYW1ldGVyOnVuZGVmaW5lZCwgV2lkdGg6dW5kZWZpbmVkLCBPZmZzZXQ6dW5kZWZpbmVkLCBCYWNrc3BhY2U6dW5kZWZpbmVkfSwge0RpYW1ldGVyOnVuZGVmaW5lZCwgV2lkdGg6dW5kZWZpbmVkLCBPZmZzZXQ6dW5kZWZpbmVkLCBCYWNrc3BhY2U6dW5kZWZpbmVkfV0sXHJcblx0XHRpc1doZWVsc0NvbmZpcm1lZCA9IGZhbHNlLFxyXG5cdFx0Y2RuVXJsID0gXCJodHRwczovL3N0YXRpYy5yaWRlc3R5bGVyLm5ldC93aWRnZXRzL3doZWVsLWNhbGN1bGF0b3IvMS4wXCIsXHJcblx0XHR0cGxVcmwgPSBjZG5VcmwgKyBcIi9odG1sL3djLnRwbFwiLFxyXG5cdFx0Y3NzVXJsID0gY2RuVXJsICsgXCIvY3NzL3djLm1pbi5jc3NcIixcclxuXHRcdHdoZWVsRGlhbU9uZSxcclxuXHRcdHdoZWVsRGlhbVR3byxcclxuXHRcdHdoZWVsRGlhbURpZmYsXHJcblx0XHR3aGVlbFdpZHRoT25lLFxyXG5cdFx0d2hlZWxXaWR0aFR3byxcclxuXHRcdHdoZWVsV2lkdGhEaWZmLFxyXG5cdFx0d2hlZWxCYWNrT25lLFxyXG5cdFx0d2hlZWxCYWNrVHdvLFxyXG5cdFx0d2hlZWxCYWNrRGlmZixcclxuXHRcdHdoZWVsT2Zmc2V0T25lLFxyXG5cdFx0d2hlZWxPZmZzZXRUd28sXHJcblx0XHR3aGVlbE9mZnNldERpZmY7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSdW5zIHdoZW4gRE9NIGNvbnRlbnQgbG9hZGVkLiBMb2FkIHJlc291cmNlcywgdGhlbiBpbml0aWFsaXplIFVJLlxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBvbkRvbVJlYWR5KCl7XHJcblx0XHRcdFByb21pc2UuYWxsKFtsb2FkVHBsLCBsb2FkU3R5bGVzXSkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGluaXRpYWxpemVVaSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGxvYWQgc3R5bGVzaGVldCBmcm9tIGNkblxyXG5cdFx0ICovXHJcblx0XHRjb25zdCBsb2FkU3R5bGVzID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdGxldCBjc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0XHRcdGNzcy5yZWwgPSBcInN0eWxlc2hlZXRcIjtcclxuXHRcdFx0Y3NzLmhyZWYgPSBjc3NVcmw7XHJcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kKGNzcyk7XHJcblxyXG5cdFx0XHRjc3Mub25sb2FkID0gZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbG9hZCB0cGwgZnJvbSBjZG5cclxuXHRcdCAqL1xyXG5cdFx0Y29uc3QgbG9hZFRwbCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiBcclxuXHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBjb21wbGV0ZWQgPSA0O1xyXG5cdFxyXG5cdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gY29tcGxldGVkKSB7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd0ZW1wbGF0ZSBmYWlsZWQgdG8gbG9hZCcpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcclxuXHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHRwbFVybCwgdHJ1ZSk7XHJcblx0XHRcdHhoci5zZW5kKG51bGwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBpbml0aWFsaXplIHVpIGZvciB0ZW1wbGF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplVWkoKXtcclxuXHRcdFx0d2hlZWxEaWFtT25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLWRpYW0wJyk7XHJcblx0XHRcdHdoZWVsRGlhbVR3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1kaWFtMScpO1xyXG5cdFx0XHR3aGVlbERpYW1EaWZmID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWRpYW0tZGlmZicpO1xyXG5cdFx0XHR3aGVlbFdpZHRoT25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLXdpZHRoMCcpO1xyXG5cdFx0XHR3aGVlbFdpZHRoVHdvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLXdoZWVsLXdpZHRoMScpO1xyXG5cdFx0XHR3aGVlbFdpZHRoRGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aWR0aC1kaWZmJyk7XHJcblx0XHRcdHdoZWVsQmFja09uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1iYWNrc3BhY2UwJyk7XHJcblx0XHRcdHdoZWVsQmFja1R3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1iYWNrc3BhY2UxJyk7XHJcblx0XHRcdHdoZWVsQmFja0RpZmYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtYmFja3NwYWNlLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtb2Zmc2V0MCcpO1xyXG5cdFx0XHR3aGVlbE9mZnNldFR3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1vZmZzZXQwJyk7XHJcblx0XHRcdHdoZWVsT2Zmc2V0RGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1vZmZzZXQtZGlmZicpO1xyXG5cdFx0XHRkaWFtZXRlclNlbGVjdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3Yy1maXJzdGknKTtcclxuXHRcdFx0d2lkdGhTZWxlY3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2Mtc2Vjb25kaScpO1xyXG5cdFx0XHRvZmZzZXRTZWxlY3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2MtdGhpcmRpJyk7XHJcblxyXG5cdFx0XHRhZGRMaXN0ZW5lcnMoZGlhbWV0ZXJTZWxlY3RzLCAnY2hhbmdlJywgb25GaXJzdENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyh3aWR0aFNlbGVjdHMsICdjaGFuZ2UnLCBvblNlY29uZENoYW5nZSk7XHJcblx0XHRcdGFkZExpc3RlbmVycyhvZmZzZXRTZWxlY3RzLCAnY2hhbmdlJywgb25UaGlyZENoYW5nZSk7XHJcblxyXG5cdFx0XHRnZXRXaGVlbERpYW1ldGVycygpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogZ2V0IHdoZWVsIGRpYW1ldGVycywgcG9wdWxhdGUgZGlhbWV0ZXIgc2VsZWN0XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFdoZWVsRGlhbWV0ZXJzKCl7XHJcblx0XHRcdGxldCBjb3VudCA9IDEyLFxyXG5cdFx0XHR3aGVlbERpYW1ldGVyTWF4ID0gMzAsXHJcblx0XHRcdHdoZWVsRGlhbWV0ZXJzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsRGlhbWV0ZXJNYXggKyAxKXtcclxuXHRcdFx0XHR3aGVlbERpYW1ldGVycy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKGRpYW1ldGVyU2VsZWN0c1swXSwgd2hlZWxEaWFtZXRlcnMpXHJcblx0XHRcdHBvcHVsYXRlRmllbGQoZGlhbWV0ZXJTZWxlY3RzWzFdLCB3aGVlbERpYW1ldGVycylcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGdldCB3aGVlbCB3aWR0aHMgZ2l2ZW4gdGhlIGN1cnJlbnQgZGlhbWV0ZXIgaW5wdXQsIHBvcHVsYXRlIHdpZHRoIHNlbGVjdFxyXG5cdFx0ICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50IC0gZGlhbWV0ZXIgaW5wdXQgZWxlbWVudHNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxXaWR0aHMoZWxlbWVudCl7XHJcblx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnRhcmdldDtcclxuXHRcdFx0bGV0IG5leHRFbCA9IGVsZW1lbnQucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2hpbGRyZW5bMF0sXHJcblx0XHRcdGNvdW50ID0gNCxcclxuXHRcdFx0d2hlZWxXaWR0aE1heCA9IDEyLjUsXHJcblx0XHRcdHdoZWVsV2lkdGhzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsV2lkdGhNYXggKyAuNSl7XHJcblx0XHRcdFx0d2hlZWxXaWR0aHMucHVzaChjb3VudCk7XHJcblx0XHRcdFx0Y291bnQrPS41O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwb3B1bGF0ZUZpZWxkKG5leHRFbCwgd2hlZWxXaWR0aHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogZ2V0IHdoZWVsIG9mZnNldHMgZ2l2ZW4gdGhlIGN1cnJlbnQgd2lkdGggaW5wdXQsIHBvcHVsYXRlIG9mZnNldCBzZWxlY3RcclxuXHRcdCAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWxlbWVudCAtIHdpZHRoIGlucHV0IGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxPZmZzZXRzKGVsZW1lbnQpe1xyXG5cdFx0XHRlbGVtZW50ID0gZWxlbWVudC50YXJnZXQ7XHJcblx0XHRcdGxldCBuZXh0RWwgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLmNoaWxkcmVuWzBdLFxyXG5cdFx0XHRjb3VudCA9IC02NSxcclxuXHRcdFx0d2hlZWxPZmZldE1heCA9IDEyNSxcclxuXHRcdFx0d2hlZWxPZmZzZXRzID0gW107XHJcblxyXG5cdFx0XHR3aGlsZShjb3VudCA8IHdoZWVsT2ZmZXRNYXggKyAxKXtcclxuXHRcdFx0XHR3aGVlbE9mZnNldHMucHVzaChjb3VudCk7XHJcblx0XHRcdFx0Y291bnQrKztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cG9wdWxhdGVGaWVsZChuZXh0RWwsIHdoZWVsT2Zmc2V0cyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogY2FsbCByaWRlc3R5bGVyIGFwaSB0byBjb21wYXJlIHR3byBnaXZlbiB3aGVlbHNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0Q29tcGFyZURhdGEoKXtcclxuXHRcdFx0c2VuZFJlcXVlc3QoXCJXaGVlbC9Db21wYXJlV2hlZWxzXCIsIFwiQ29tcGFyaXNvblwiLCB7QmFzZVdoZWVsOiB3aGVlbFswXSwgTmV3V2hlZWw6IHdoZWVsWzFdfSkudGhlbihmdW5jdGlvbihjb21wYXJpc29uRGF0YSl7XHJcblx0XHRcdFx0d2hlZWxEaWFtT25lLmlubmVySFRNTCA9IGNvbXBhcmlzb25EYXRhLkJhc2VXaGVlbC5EaWFtZXRlcjtcclxuXHRcdFx0XHR3aGVlbERpYW1Ud28uaW5uZXJIVE1MID0gY29tcGFyaXNvbkRhdGEuTmV3V2hlZWwuRGlhbWV0ZXI7XHJcblx0XHRcdFx0d2hlZWxEaWFtRGlmZi5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlcy5PdXRzaWRlRGlhbWV0ZXI7XHJcblx0XHRcdFx0d2hlZWxXaWR0aE9uZS5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5CYXNlV2hlZWwuV2lkdGg7XHJcblx0XHRcdFx0d2hlZWxXaWR0aFR3by5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5OZXdXaGVlbC5XaWR0aDtcclxuXHRcdFx0XHR3aGVlbFdpZHRoRGlmZi5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlcy5XaWR0aDtcclxuXHRcdFx0XHR3aGVlbEJhY2tPbmUuaW5uZXJIVE1MID0gY29tcGFyaXNvbkRhdGEuQmFzZVdoZWVsLkJhY2s7XHJcblx0XHRcdFx0d2hlZWxCYWNrVHdvLmlubmVySFRNTCA9IGNvbXBhcmlzb25EYXRhLk5ld1doZWVsLkJhY2s7XHJcblx0XHRcdFx0d2hlZWxCYWNrRGlmZi5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlcy5CYWNrU3BhY2luZztcclxuXHRcdFx0XHR3aGVlbE9mZnNldE9uZS5pbm5lckhUTUwgPSBjb21wYXJpc29uRGF0YS5CYXNlV2hlZWwuT2Zmc2V0O1xyXG5cdFx0XHRcdHdoZWVsT2Zmc2V0VHdvLmlubmVySFRNTCA9IGNvbXBhcmlzb25EYXRhLk5ld1doZWVsLk9mZnNldDtcclxuXHRcdFx0XHR3aGVlbE9mZnNldERpZmYuaW5uZXJIVE1MID0gY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXMuT2Zmc2V0O1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHBvcHVsYXRlIHNlbGVjdCBmaWVsZHMgd2l0aCBnaXZlbiBkYXRhXHJcblx0XHQgKiBAcGFyYW0ge05vZGVMaXN0fSBmaWVsZCAtIGVsZW1lbnQgeW91IHdhbnQgdG8gcG9wdWxhdGVcclxuXHRcdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJheSAtIGRhdGEgeW91IHRvIGFkZCB0byBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlRmllbGQoZmllbGQsIGRhdGFBcnJheSl7XHJcblx0XHRcdGRhdGFBcnJheS5mb3JFYWNoKGRhdGEgPT4ge1xyXG5cdFx0XHRcdGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRvcHRpb24udmFsdWUgPSBkYXRhO1xyXG5cdFx0XHRcdG9wdGlvbi5pbm5lckhUTUwgPSBkYXRhO1xyXG5cclxuXHRcdFx0XHRmaWVsZC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmKGZpZWxkLmRpc2FibGVkKSBmaWVsZC5kaXNhYmxlZCA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVXBkYXRlIG91ciB3aGVlbCBvYmplY3Qgd2l0aCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gRE9NIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gdXBkYXRlV2hlZWxPYmplY3QoZSl7XHJcblx0XHRcdGxldCB3aGVlbEVsZW1lbnQgPSBlLnRhcmdldCxcclxuXHRcdFx0d2hlZWxJbmRleCA9IHdoZWVsRWxlbWVudC5pZC5jaGFyQXQod2hlZWxFbGVtZW50LmlkLmxlbmd0aCAtIDEpO1xyXG5cclxuXHRcdFx0aWYod2hlZWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnd2MtZmlyc3RpJykpe1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIkRpYW1ldGVyXCJdID0gd2hlZWxFbGVtZW50LnZhbHVlO1xyXG5cdFx0XHR9IGVsc2UgaWYod2hlZWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnd2Mtc2Vjb25kaScpKSB7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiV2lkdGhcIl0gPSB3aGVlbEVsZW1lbnQudmFsdWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiT2Zmc2V0XCJdID0gd2hlZWxFbGVtZW50LnZhbHVlO1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIkJhY2tzcGFjZVwiXSA9IGdldEJhY2tzcGFjaW5nKHdoZWVsc1t3aGVlbEluZGV4XVtcIldpZHRoXCJdLCB3aGVlbHNbd2hlZWxJbmRleF1bXCJPZmZzZXRcIl0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih3aGVlbHNbMF0uT2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgd2hlZWxzWzFdLk9mZnNldCAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRpc1doZWVsc0NvbmZpcm1lZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBEaXNwbGF5IHdoZWVsIGRhdGEgZ2l2ZW4gdGhlIGRvbSBlbGVtZW50IHdpdGggbmV3IHZhbHVlXHJcblx0XHQgKiBAcGFyYW0ge29iamVjdH0gd2hlZWxEYXRhIC0gT2JqZWN0IG9mIG5ldyB3aGVlbCBkYXRhXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGRpc3BsYXlXaGVlbERhdGEod2hlZWxEYXRhKSB7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2VuZXJhdGUgYmFja3NwYWNpbmcgZ2l2ZW4gdGhlIHdpdGggYW5kIG9mZnNldFxyXG5cdFx0ICogQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggb2Ygd2hlZWxcclxuXHRcdCAqIEBwYXJhbSB7aW50fSBvZmZzZXQgLSBvZmZzZXQgb2Ygd2hlZWxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0QmFja3NwYWNpbmcod2lkdGgsIG9mZnNldCl7XHJcblx0XHRcdGxldCBiYWNrU3BhY2luZyxcclxuXHRcdFx0b2Zmc2V0SW5JbmNoZXMgPSBtbVRvSW5jaGVzKG9mZnNldCksXHJcblx0XHRcdHdoZWVsQ2VudGVyID0gcGFyc2VJbnQod2lkdGggLyAyKTtcclxuXHJcblx0XHRcdGJhY2tTcGFjaW5nID0gKHdoZWVsQ2VudGVyICsgb2Zmc2V0SW5JbmNoZXMpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGJhY2tTcGFjaW5nO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbW0gdG8gaW5jaGVzXHJcblx0XHQgKiBAcGFyYW0ge2ludH0gbW0gLSBtbSBtZWFzdXJlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBtbVRvSW5jaGVzKG1tKSB7XHJcblx0XHRcdGxldCBpbmNoZXMsXHJcblx0XHRcdG1tVG9JbmNoID0gMjUuNDtcclxuXHJcblx0XHRcdGluY2hlcyA9IHBhcnNlSW50KChtbSAvIG1tVG9JbmNoKS50b0ZpeGVkKDIpKTtcclxuXHJcblx0XHRcdHJldHVybiBpbmNoZXM7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZW5kIHJpZGVzdHlsZXIgYXBpIHJlcXVlc3RcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBlbmRwb2ludCAtIGVuZHBvaW50IGZvciByZXF1ZXN0XHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gZ2V0dGVyIC0gcHJvcGVydHkgeW91IHdhbnQgdG8gZ3JhYiBmcm9tIHJlc3VsdFxyXG5cdFx0ICogQHBhcmFtIHtvYmplY3R8fGZvcm1EYXRhfSBkYXRhIC0gZGF0YSB0byBpbmNsdWRlIGluIHJlcXVlc3RcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2VuZFJlcXVlc3QoZW5kcG9pbnQsIGdldHRlciwgZGF0YSl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7XHJcblx0XHRcdFx0XHRhY3Rpb246IGVuZHBvaW50LFxyXG5cdFx0XHRcdFx0ZGF0YTogZGF0YSxcclxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbiAocmVzKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzW2dldHRlcl0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIGxpc3RlbmVyIHRvIGEgRE9NIEVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSB7RE9NRWxlbWVudH0gZWwgLSBkb20gZWxlbWVudFxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IGxpc3RlbmVyIC0gdHlwZSBvZiBldmVudCBsaXN0ZW5lclxyXG5cdFx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2IgLSBjYWxsYmFjayBmdW5jdGlvblxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoZWwsIGxpc3RlbmVyLCBjYil7XHJcblx0XHRcdGlmKHR5cGVvZiBlbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZWwgPT09IFwiYXJyYXlcIil7XHJcblx0XHRcdFx0Zm9yKGxldCBlIG9mIGVsKXtcclxuXHRcdFx0XHRcdGUuYWRkRXZlbnRMaXN0ZW5lcihsaXN0ZW5lciwgY2IpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKGxpc3RlbmVyLCBjYik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGZpcnN0IHNlbGVjdCBjaGFuZ2VcclxuXHRcdCAqIEBwYXJhbSB7RE9NIEVsZW1lbnR9IGUgLSBzZWxlY3QgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBvbkZpcnN0Q2hhbmdlKGUpe1xyXG5cdFx0XHR1cGRhdGVXaGVlbE9iamVjdChlKTtcclxuXHRcdFx0Z2V0V2hlZWxXaWR0aHMoZSk7XHJcblx0XHRcdGdldENvbXBhcmVEYXRhKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBzZWNvbmQgc2VsZWN0IGNoYW5nZVxyXG5cdFx0ICogQHBhcmFtIHtET00gRWxlbWVudH0gZSAtIHNlbGVjdCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uU2Vjb25kQ2hhbmdlKGUpe1xyXG5cdFx0XHR1cGRhdGVXaGVlbE9iamVjdChlKTtcclxuXHRcdFx0Z2V0V2hlZWxPZmZzZXRzKGUpO1xyXG5cdFx0XHRnZXRDb21wYXJlRGF0YSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogdGhpcmQgc2VsZWN0IGNoYW5nZVxyXG5cdFx0ICogQHBhcmFtIHtET00gRWxlbWVudH0gZSAtIHNlbGVjdCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uVGhpcmRDaGFuZ2UoZSl7XHJcblx0XHRcdHVwZGF0ZVdoZWVsT2JqZWN0KGUpO1xyXG5cdFx0XHRkaXNwbGF5V2hlZWxEYXRhKGUpO1xyXG5cdFx0XHRnZXRDb21wYXJlRGF0YSgpO1xyXG5cclxuXHRcdFx0aWYoaXNXaGVlbHNDb25maXJtZWQpe1xyXG5cdFx0XHRcdC8vIGRpc3BsYXlEaWZmZXJlbmNlcygpO1xyXG5cdFx0XHRcdC8vIGdlbmVyYXRlRGlmZmVyZW5jZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT24gd2luZG93IGxvYWQgRE9NIGNvbnRlbnRcclxuXHRcdCAqL1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRvbkRvbVJlYWR5KCk7XHJcblx0XHRcdC8vIGluaXRpYWxpemVVaSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHdpbmRvdy5XaGVlbENhbGN1bGF0b3IgPSBXaGVlbENhbGN1bGF0b3I7XHJcbn0pKCk7XHJcbiJdfQ==
