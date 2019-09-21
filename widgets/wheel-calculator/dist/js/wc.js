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
        clearanceNotes;
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

      if (wheels[0].Offset !== undefined && wheels[1].Offset !== undefined) {
        isWheelsConfirmed = true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvV2hlZWxDYWxjdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLENBQUMsWUFBWTtBQUNaOzs7Ozs7QUFNQSxXQUFTLGVBQVQsQ0FBeUIsV0FBekIsRUFBc0MsT0FBdEMsRUFBK0M7QUFDOUMsUUFBSSxlQUFKO0FBQUEsUUFDQSxZQURBO0FBQUEsUUFFQSxhQUZBO0FBQUEsUUFHQSxNQUFNLEdBQUcsQ0FBQztBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBRCxFQUErRTtBQUFDLE1BQUEsUUFBUSxFQUFDLFNBQVY7QUFBcUIsTUFBQSxLQUFLLEVBQUMsU0FBM0I7QUFBc0MsTUFBQSxNQUFNLEVBQUMsU0FBN0M7QUFBd0QsTUFBQSxTQUFTLEVBQUM7QUFBbEUsS0FBL0UsQ0FIVDtBQUFBLFFBSUEsaUJBQWlCLEdBQUcsS0FKcEI7QUFBQSxRQUtBLE1BQU0sR0FBRyw0REFMVDtBQUFBLFFBTUEsTUFBTSxHQUFHLE1BQU0sR0FBRyxjQU5sQjtBQUFBLFFBT0EsTUFBTSxHQUFHLE1BQU0sR0FBRyxpQkFQbEI7QUFBQSxRQVFBLFlBUkE7QUFBQSxRQVNBLFlBVEE7QUFBQSxRQVVBLGFBVkE7QUFBQSxRQVdBLGFBWEE7QUFBQSxRQVlBLGFBWkE7QUFBQSxRQWFBLGNBYkE7QUFBQSxRQWNBLFlBZEE7QUFBQSxRQWVBLFlBZkE7QUFBQSxRQWdCQSxhQWhCQTtBQUFBLFFBaUJBLGFBakJBO0FBQUEsUUFrQkEsYUFsQkE7QUFBQSxRQW1CQSxjQW5CQTtBQUFBLFFBb0JBLGNBcEJBO0FBQUEsUUFxQkEsY0FyQkE7QUFBQSxRQXNCQSxlQXRCQTtBQUFBLFFBdUJBLGtCQXZCQTtBQUFBLFFBd0JBLGVBeEJB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QVYsS0FBcUIsU0FBeEIsRUFBa0M7QUFDakMsUUFBQSxjQUFjO0FBQ2Q7QUFDRDtBQUVEOzs7Ozs7QUFJQSxhQUFTLGFBQVQsQ0FBdUIsQ0FBdkIsRUFBeUI7QUFDeEIsTUFBQSxpQkFBaUIsQ0FBQyxDQUFELENBQWpCOztBQUNBLFVBQUcsTUFBTSxDQUFDLENBQUQsQ0FBTixDQUFVLE1BQVYsS0FBcUIsU0FBeEIsRUFBa0M7QUFDakMsUUFBQSxjQUFjO0FBQ2Q7QUFDRDtBQUVEOzs7OztBQUdBLElBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxVQUFTLEtBQVQsRUFBZ0I7QUFDN0QsTUFBQSxVQUFVLEdBRG1ELENBRTdEO0FBQ0EsS0FIRDtBQUlBOztBQUNELEVBQUEsTUFBTSxDQUFDLGVBQVAsR0FBeUIsZUFBekI7QUFDQSxDQS9ZRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogV2hlZWxDYWxjdWxhdG9yOiBSZW5kZXIgdGhlIFdoZWVsIENhbGN1bGF0b3Igd2lkZ2V0IHdpdGhpbiBhIGNvbnRhaW5lciBlbGVtZW50XHJcblx0ICogQGNvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGNvbnRhaW5lcklkIC0gVGhlIGlkIG9mIHRoZSB3aWRnZXQncyBwYXJlbnQgZWxlbWVudFxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uYWwgYXJndW1lbnRzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gV2hlZWxDYWxjdWxhdG9yKGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgZGlhbWV0ZXJTZWxlY3RzLFxyXG5cdFx0d2lkdGhTZWxlY3RzLFxyXG5cdFx0b2Zmc2V0U2VsZWN0cyxcclxuXHRcdHdoZWVscyA9IFt7RGlhbWV0ZXI6dW5kZWZpbmVkLCBXaWR0aDp1bmRlZmluZWQsIE9mZnNldDp1bmRlZmluZWQsIEJhY2tzcGFjZTp1bmRlZmluZWR9LCB7RGlhbWV0ZXI6dW5kZWZpbmVkLCBXaWR0aDp1bmRlZmluZWQsIE9mZnNldDp1bmRlZmluZWQsIEJhY2tzcGFjZTp1bmRlZmluZWR9XSxcclxuXHRcdGlzV2hlZWxzQ29uZmlybWVkID0gZmFsc2UsXHJcblx0XHRjZG5VcmwgPSBcImh0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIubmV0L3dpZGdldHMvd2hlZWwtY2FsY3VsYXRvci8xLjBcIixcclxuXHRcdHRwbFVybCA9IGNkblVybCArIFwiL2h0bWwvd2MudHBsXCIsXHJcblx0XHRjc3NVcmwgPSBjZG5VcmwgKyBcIi9jc3Mvd2MubWluLmNzc1wiLFxyXG5cdFx0d2hlZWxEaWFtT25lLFxyXG5cdFx0d2hlZWxEaWFtVHdvLFxyXG5cdFx0d2hlZWxEaWFtRGlmZixcclxuXHRcdHdoZWVsV2lkdGhPbmUsXHJcblx0XHR3aGVlbFdpZHRoVHdvLFxyXG5cdFx0d2hlZWxXaWR0aERpZmYsXHJcblx0XHR3aGVlbEJhY2tPbmUsXHJcblx0XHR3aGVlbEJhY2tUd28sXHJcblx0XHR3aGVlbEJhY2tEaWZmLFxyXG5cdFx0d2hlZWxGcm9udE9uZSxcclxuXHRcdHdoZWVsRnJvbnRUd28sXHJcblx0XHR3aGVlbEZyb250RGlmZixcclxuXHRcdHdoZWVsT2Zmc2V0T25lLFxyXG5cdFx0d2hlZWxPZmZzZXRUd28sXHJcblx0XHR3aGVlbE9mZnNldERpZmYsXHJcblx0XHR3aGVlbERldFN1c3BlbnNpb24sXHJcblx0XHR3aGVlbERldEZlbmRlcnMsXHJcblx0XHR3aGVlbERldFdoZWVsV2VsbHMsXHJcblx0XHR3aGVlbERldEJyYWtlcyxcclxuXHRcdGNsZWFyYW5jZU5vdGVzO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUnVucyB3aGVuIERPTSBjb250ZW50IGxvYWRlZC4gTG9hZCByZXNvdXJjZXMsIHRoZW4gaW5pdGlhbGl6ZSBVSS5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gb25Eb21SZWFkeSgpe1xyXG5cdFx0XHRsb2FkU3R5bGVzKCkudGhlbihmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRpbml0aWFsaXplVWkoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBsb2FkIHN0eWxlc2hlZXQgZnJvbSBjZG5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFN0eWxlcygpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0bGV0IGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuXHRcdFx0XHRjc3MucmVsID0gXCJzdHlsZXNoZWV0XCI7XHJcblx0XHRcdFx0Y3NzLmhyZWYgPSBjc3NVcmw7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmQoY3NzKTtcclxuXHJcblx0XHRcdFx0Y3NzLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIGxvYWQgdHBsIGZyb20gY2RuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRUcGwoKXsgXHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXHJcblx0XHRcdFx0Y29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVySWQpO1xyXG5cdFxyXG5cdFx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBjb21wbGV0ZWQgPSA0O1xyXG5cdFx0XHJcblx0XHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IGNvbXBsZXRlZCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3RlbXBsYXRlIGZhaWxlZCB0byBsb2FkJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHJcblx0XHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHRwbFVybCwgdHJ1ZSk7XHJcblx0XHRcdFx0eGhyLnNlbmQobnVsbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogaW5pdGlhbGl6ZSB1aSBmb3IgdGVtcGxhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVVpKCl7XHJcblx0XHRcdHdoZWVsRGlhbU9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1kaWFtMCcpO1xyXG5cdFx0XHR3aGVlbERpYW1Ud28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtZGlhbTEnKTtcclxuXHRcdFx0d2hlZWxEaWFtRGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1kaWFtLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxXaWR0aE9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC13aWR0aDAnKTtcclxuXHRcdFx0d2hlZWxXaWR0aFR3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC13aWR0aDEnKTtcclxuXHRcdFx0d2hlZWxXaWR0aERpZmYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2lkdGgtZGlmZicpO1xyXG5cdFx0XHR3aGVlbEJhY2tPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtYmFja3NwYWNlMCcpO1xyXG5cdFx0XHR3aGVlbEJhY2tUd28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtYmFja3NwYWNlMScpO1xyXG5cdFx0XHR3aGVlbEJhY2tEaWZmID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWJhY2tzcGFjZS1kaWZmJyk7XHJcblx0XHRcdHdoZWVsRnJvbnRPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtZnJvbnRzcGFjZTAnKTtcclxuXHRcdFx0d2hlZWxGcm9udFR3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1mcm9udHNwYWNlMScpO1xyXG5cdFx0XHR3aGVlbEZyb250RGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1mcm9udHNwYWNlLWRpZmYnKTtcclxuXHRcdFx0d2hlZWxPZmZzZXRPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2Mtd2hlZWwtb2Zmc2V0MCcpO1xyXG5cdFx0XHR3aGVlbE9mZnNldFR3byA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy13aGVlbC1vZmZzZXQxJyk7XHJcblx0XHRcdHdoZWVsT2Zmc2V0RGlmZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1vZmZzZXQtZGlmZicpO1xyXG5cdFx0XHRkaWFtZXRlclNlbGVjdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3Yy1maXJzdGknKTtcclxuXHRcdFx0d2lkdGhTZWxlY3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2Mtc2Vjb25kaScpO1xyXG5cdFx0XHRvZmZzZXRTZWxlY3RzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2MtdGhpcmRpJyk7XHJcblx0XHRcdHdoZWVsRGV0U3VzcGVuc2lvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3Yy1kZXRhaWxzLXN1c3BlbnNpb24nKTtcclxuXHRcdFx0d2hlZWxEZXRGZW5kZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWRldGFpbHMtZmVuZGVycycpO1xyXG5cdFx0XHR3aGVlbERldFdoZWVsV2VsbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2MtZGV0YWlscy13aGVlbHdlbGxzJyk7XHJcblx0XHRcdHdoZWVsRGV0QnJha2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWRldGFpbHMtYnJha2VzJyk7XHJcblx0XHRcdGNsZWFyYW5jZU5vdGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3djLWNsZWFyYW5jZS1jb250YWluZXInKTtcclxuXHJcblx0XHRcdGFkZExpc3RlbmVycyhkaWFtZXRlclNlbGVjdHMsICdjaGFuZ2UnLCBvbkZpcnN0Q2hhbmdlKTtcclxuXHRcdFx0YWRkTGlzdGVuZXJzKHdpZHRoU2VsZWN0cywgJ2NoYW5nZScsIG9uU2Vjb25kQ2hhbmdlKTtcclxuXHRcdFx0YWRkTGlzdGVuZXJzKG9mZnNldFNlbGVjdHMsICdjaGFuZ2UnLCBvblRoaXJkQ2hhbmdlKTtcclxuXHJcblx0XHRcdGdldFdoZWVsRGlhbWV0ZXJzKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBnZXQgd2hlZWwgZGlhbWV0ZXJzLCBwb3B1bGF0ZSBkaWFtZXRlciBzZWxlY3RcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0V2hlZWxEaWFtZXRlcnMoKXtcclxuXHRcdFx0bGV0IGNvdW50ID0gMTIsXHJcblx0XHRcdHdoZWVsRGlhbWV0ZXJNYXggPSAzMCxcclxuXHRcdFx0d2hlZWxEaWFtZXRlcnMgPSBbXTtcclxuXHJcblx0XHRcdHdoaWxlKGNvdW50IDwgd2hlZWxEaWFtZXRlck1heCArIDEpe1xyXG5cdFx0XHRcdHdoZWVsRGlhbWV0ZXJzLnB1c2goY291bnQpO1xyXG5cdFx0XHRcdGNvdW50Kys7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHdoZWVsRGlhbWV0ZXJzLnVuc2hpZnQoXCJEaWFtZXRlclwiKTtcclxuXHJcblx0XHRcdHBvcHVsYXRlRmllbGQoZGlhbWV0ZXJTZWxlY3RzWzBdLCB3aGVlbERpYW1ldGVycylcclxuXHRcdFx0cG9wdWxhdGVGaWVsZChkaWFtZXRlclNlbGVjdHNbMV0sIHdoZWVsRGlhbWV0ZXJzKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogZ2V0IHdoZWVsIHdpZHRocyBnaXZlbiB0aGUgY3VycmVudCBkaWFtZXRlciBpbnB1dCwgcG9wdWxhdGUgd2lkdGggc2VsZWN0XHJcblx0XHQgKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsZW1lbnQgLSBkaWFtZXRlciBpbnB1dCBlbGVtZW50c1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRXaGVlbFdpZHRocyhlbGVtZW50KXtcclxuXHRcdFx0ZWxlbWVudCA9IGVsZW1lbnQudGFyZ2V0O1xyXG5cdFx0XHRsZXQgbmV4dEVsID0gZWxlbWVudC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5jaGlsZHJlblswXSxcclxuXHRcdFx0Y291bnQgPSA0LFxyXG5cdFx0XHR3aGVlbFdpZHRoTWF4ID0gMTIuNSxcclxuXHRcdFx0d2hlZWxXaWR0aHMgPSBbXTtcclxuXHJcblx0XHRcdHdoaWxlKGNvdW50IDwgd2hlZWxXaWR0aE1heCArIC41KXtcclxuXHRcdFx0XHR3aGVlbFdpZHRocy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCs9LjU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHdoZWVsV2lkdGhzLnVuc2hpZnQoXCJXaWR0aFwiKTtcclxuXHJcblx0XHRcdHBvcHVsYXRlRmllbGQobmV4dEVsLCB3aGVlbFdpZHRocyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBnZXQgd2hlZWwgb2Zmc2V0cyBnaXZlbiB0aGUgY3VycmVudCB3aWR0aCBpbnB1dCwgcG9wdWxhdGUgb2Zmc2V0IHNlbGVjdFxyXG5cdFx0ICogQHBhcmFtIHtET01FbGVtZW50fSBlbGVtZW50IC0gd2lkdGggaW5wdXQgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRXaGVlbE9mZnNldHMoZWxlbWVudCl7XHJcblx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnRhcmdldDtcclxuXHRcdFx0bGV0IG5leHRFbCA9IGVsZW1lbnQucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcuY2hpbGRyZW5bMF0sXHJcblx0XHRcdGNvdW50ID0gLTY1LFxyXG5cdFx0XHR3aGVlbE9mZmV0TWF4ID0gMTI1LFxyXG5cdFx0XHR3aGVlbE9mZnNldHMgPSBbXTtcclxuXHJcblx0XHRcdHdoaWxlKGNvdW50IDwgd2hlZWxPZmZldE1heCArIDEpe1xyXG5cdFx0XHRcdHdoZWVsT2Zmc2V0cy5wdXNoKGNvdW50KTtcclxuXHRcdFx0XHRjb3VudCsrO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR3aGVlbE9mZnNldHMudW5zaGlmdChcIk9mZnNldFwiKTtcclxuXHJcblx0XHRcdHBvcHVsYXRlRmllbGQobmV4dEVsLCB3aGVlbE9mZnNldHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogcG9wdWxhdGUgc2VsZWN0IGZpZWxkcyB3aXRoIGdpdmVuIGRhdGFcclxuXHRcdCAqIEBwYXJhbSB7Tm9kZUxpc3R9IGZpZWxkIC0gZWxlbWVudCB5b3Ugd2FudCB0byBwb3B1bGF0ZVxyXG5cdFx0ICogQHBhcmFtIHthcnJheX0gZGF0YUFycmF5IC0gZGF0YSB5b3UgdG8gYWRkIHRvIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gcG9wdWxhdGVGaWVsZChmaWVsZCwgZGF0YUFycmF5KXtcclxuXHRcdFx0ZGF0YUFycmF5LmZvckVhY2goZGF0YSA9PiB7XHJcblx0XHRcdFx0bGV0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IGRhdGE7XHJcblx0XHRcdFx0b3B0aW9uLmlubmVySFRNTCA9IGRhdGE7XHJcblxyXG5cdFx0XHRcdGZpZWxkLmFwcGVuZENoaWxkKG9wdGlvbik7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYoZmllbGQuZGlzYWJsZWQpIGZpZWxkLmRpc2FibGVkID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBjYWxsIHJpZGVzdHlsZXIgYXBpIHRvIGNvbXBhcmUgdHdvIGdpdmVuIHdoZWVsc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRDb21wYXJlRGF0YSgpe1xyXG5cdFx0XHRsZXQgcmVxdWVzdERhdGEgPSB7QmFzZVNpemU6d2hlZWxzWzBdLkRpYW1ldGVyICsgXCJ4XCIgKyB3aGVlbHNbMF0uV2lkdGggKyBcIkVUXCIgKyB3aGVlbHNbMF0uT2Zmc2V0LCBcIk5ld1NpemVzWzBdXCI6d2hlZWxzWzFdLkRpYW1ldGVyICsgXCJ4XCIgKyB3aGVlbHNbMV0uV2lkdGggKyBcIiBFVFwiICsgd2hlZWxzWzFdLk9mZnNldH1cclxuXHJcblx0XHRcdHNlbmRSZXF1ZXN0KFwiV2hlZWwvQ29tcGFyZVNpemVzXCIsIHJlcXVlc3REYXRhKS50aGVuKGZ1bmN0aW9uKGNvbXBhcmlzb25EYXRhKXtcclxuXHRcdFx0XHRpZihjb21wYXJpc29uRGF0YSl7XHJcblx0XHRcdFx0XHRkaXNwbGF5Q29tcGFyZURhdGEoY29tcGFyaXNvbkRhdGEpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBkaXNwbGF5Q29tcGFyZURhdGEoY29tcGFyaXNvbkRhdGEpe1xyXG5cdFx0XHR3aGVlbERpYW1PbmUuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5CYXNlU2l6ZS5EaXNwbGF5RGlhbWV0ZXIpO1xyXG5cdFx0XHR3aGVlbERpYW1Ud28uaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5OZXdTaXplc1swXS5EaXNwbGF5RGlhbWV0ZXIpO1xyXG5cdFx0XHR3aGVlbERpYW1EaWZmLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuRGlmZmVyZW5jZXNbMF0uRGlhbWV0ZXIuUGVyY2VudCwgXCJkaWZmXCIpO1xyXG5cdFx0XHR3aGVlbFdpZHRoT25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheVdpZHRoKS50b0ZpeGVkKDEpO1xyXG5cdFx0XHR3aGVlbFdpZHRoVHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheVdpZHRoKS50b0ZpeGVkKDEpO1xyXG5cdFx0XHR3aGVlbFdpZHRoRGlmZi5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkRpZmZlcmVuY2VzWzBdLldpZHRoLlBlcmNlbnQsIFwiZGlmZlwiKTtcclxuXHRcdFx0d2hlZWxCYWNrT25lLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuQmFzZVNpemUuRGlzcGxheUJhY2tzcGFjaW5nKS50b0ZpeGVkKDIpO1xyXG5cdFx0XHR3aGVlbEJhY2tUd28uaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5OZXdTaXplc1swXS5EaXNwbGF5QmFja3NwYWNpbmcpLnRvRml4ZWQoMik7XHJcblx0XHRcdHdoZWVsQmFja0RpZmYuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlc1swXS5CYWNrc3BhY2luZy5QZXJjZW50LCBcImRpZmZcIik7XHJcblx0XHRcdHdoZWVsRnJvbnRPbmUuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5CYXNlU2l6ZS5EaXNwbGF5RnJvbnRzcGFjaW5nKS50b0ZpeGVkKDIpO1xyXG5cdFx0XHR3aGVlbEZyb250VHdvLmlubmVySFRNTCA9IHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTmV3U2l6ZXNbMF0uRGlzcGxheUZyb250c3BhY2luZykudG9GaXhlZCgyKTtcclxuXHRcdFx0d2hlZWxGcm9udERpZmYuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlc1swXS5Gcm9udHNwYWNpbmcuUGVyY2VudCwgXCJkaWZmXCIpO1xyXG5cdFx0XHR3aGVlbE9mZnNldE9uZS5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLkJhc2VTaXplLkRpc3BsYXlPZmZzZXQpO1xyXG5cdFx0XHR3aGVlbE9mZnNldFR3by5pbm5lckhUTUwgPSB2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk5ld1NpemVzWzBdLkRpc3BsYXlPZmZzZXQpO1xyXG5cdFx0XHR3aGVlbE9mZnNldERpZmYuaW5uZXJIVE1MID0gdmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5EaWZmZXJlbmNlc1swXS5PZmZzZXQuUGVyY2VudCwgXCJkaWZmXCIpO1xyXG5cdFx0XHR2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk1lc3NhZ2VzWzBdWzBdLCBcIm1lc3NhZ2VcIiwgd2hlZWxEZXRTdXNwZW5zaW9uKTtcclxuXHRcdFx0dmVyaWZ5RGF0YShjb21wYXJpc29uRGF0YS5NZXNzYWdlc1swXVsxXSwgXCJtZXNzYWdlXCIsIHdoZWVsRGV0RmVuZGVycyk7XHJcblx0XHRcdHZlcmlmeURhdGEoY29tcGFyaXNvbkRhdGEuTWVzc2FnZXNbMF1bMl0sIFwibWVzc2FnZVwiLCB3aGVlbERldFdoZWVsV2VsbHMpO1xyXG5cdFx0XHR2ZXJpZnlEYXRhKGNvbXBhcmlzb25EYXRhLk1lc3NhZ2VzWzBdWzNdLCBcIm1lc3NhZ2VcIiwgd2hlZWxEZXRCcmFrZXMpO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gdmVyaWZ5RGF0YShkYXRhLCB0eXBlLCBlbCl7XHJcblx0XHRcdFx0bGV0IHJldHVybkRhdGEgPSBkYXRhO1xyXG5cclxuXHRcdFx0XHRpZih0eXBlID09PSBcImRpZmZcIil7XHJcblx0XHRcdFx0XHRpZihpc05hTihwYXJzZUludChyZXR1cm5EYXRhKSkgPT09IGZhbHNlKXtcclxuXHRcdFx0XHRcdFx0cmV0dXJuRGF0YSA9IHJldHVybkRhdGEudG9GaXhlZCgyKSArIFwiJVwiXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIGlmKHR5cGUgPT09IFwibWVzc2FnZVwiKSB7XHJcblx0XHRcdFx0XHRjbGVhcmFuY2VOb3Rlcy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHRcdFx0XHRcdGlmKHJldHVybkRhdGEuVHlwZSA9PSAxKXtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2MtZXJyb3InKTtcclxuXHRcdFx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnd2Mtd2FybmluZycpO1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKCd3Yy13YXJuaW5nJyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYocmV0dXJuRGF0YS5UeXBlID09IDIpe1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCd3Yy1lcnJvcicpO1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCd3Yy13YXJuaW5nJyk7XHJcblx0XHRcdFx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoJ3djLWVycm9yJyk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCd3Yy1lcnJvcicpO1xyXG5cdFx0XHRcdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKCd3Yy13YXJuaW5nJyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRyZXR1cm5EYXRhID0gcmV0dXJuRGF0YS5NZXNzYWdlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYocmV0dXJuRGF0YSAhPT0gdW5kZWZpbmVkICYmIGVsID09PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0cmV0dXJuIHJldHVybkRhdGE7XHJcblx0XHRcdFx0fSBlbHNlIGlmKGVsICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdGVsLmlubmVySFRNTCA9IHJldHVybkRhdGE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVcGRhdGUgb3VyIHdoZWVsIG9iamVjdCB3aXRoIG5ldyB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7RE9NIEVsZW1lbnR9IGUgLSBET00gZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiB1cGRhdGVXaGVlbE9iamVjdChlKXtcclxuXHRcdFx0bGV0IHdoZWVsRWxlbWVudCA9IGUudGFyZ2V0LFxyXG5cdFx0XHR3aGVlbEluZGV4ID0gd2hlZWxFbGVtZW50LmlkLmNoYXJBdCh3aGVlbEVsZW1lbnQuaWQubGVuZ3RoIC0gMSksXHJcblx0XHRcdHdoZWVsVmFsdWUgPSB3aGVlbEVsZW1lbnQudmFsdWU7XHJcblxyXG5cdFx0XHRpZih3aGVlbFZhbHVlICE9PSBpc05hTil7fVxyXG5cdFx0XHRpZih3aGVlbEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd3Yy1maXJzdGknKSl7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiRGlhbWV0ZXJcIl0gPSB3aGVlbFZhbHVlO1xyXG5cdFx0XHR9IGVsc2UgaWYod2hlZWxFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnd2Mtc2Vjb25kaScpKSB7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiV2lkdGhcIl0gPSB3aGVlbFZhbHVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHdoZWVsc1t3aGVlbEluZGV4XVtcIk9mZnNldFwiXSA9IHdoZWVsVmFsdWU7XHJcblx0XHRcdFx0d2hlZWxzW3doZWVsSW5kZXhdW1wiQmFja3NwYWNlXCJdID0gZ2V0QmFja3NwYWNpbmcod2hlZWxzW3doZWVsSW5kZXhdW1wiV2lkdGhcIl0sIHdoZWVsc1t3aGVlbEluZGV4XVtcIk9mZnNldFwiXSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHdoZWVsc1swXS5PZmZzZXQgIT09IHVuZGVmaW5lZCAmJiB3aGVlbHNbMV0uT2Zmc2V0ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdGlzV2hlZWxzQ29uZmlybWVkID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2VuZXJhdGUgYmFja3NwYWNpbmcgZ2l2ZW4gdGhlIHdpdGggYW5kIG9mZnNldFxyXG5cdFx0ICogQHBhcmFtIHtpbnR9IHdpZHRoIC0gd2lkdGggb2Ygd2hlZWxcclxuXHRcdCAqIEBwYXJhbSB7aW50fSBvZmZzZXQgLSBvZmZzZXQgb2Ygd2hlZWxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0QmFja3NwYWNpbmcod2lkdGgsIG9mZnNldCl7XHJcblx0XHRcdGxldCBiYWNrU3BhY2luZyxcclxuXHRcdFx0b2Zmc2V0SW5JbmNoZXMgPSBtbVRvSW5jaGVzKG9mZnNldCksXHJcblx0XHRcdHdoZWVsQ2VudGVyID0gcGFyc2VJbnQod2lkdGggLyAyKTtcclxuXHJcblx0XHRcdGJhY2tTcGFjaW5nID0gKHdoZWVsQ2VudGVyICsgb2Zmc2V0SW5JbmNoZXMpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGJhY2tTcGFjaW5nO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogbW0gdG8gaW5jaGVzXHJcblx0XHQgKiBAcGFyYW0ge2ludH0gbW0gLSBtbSBtZWFzdXJlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBtbVRvSW5jaGVzKG1tKSB7XHJcblx0XHRcdGxldCBpbmNoZXMsXHJcblx0XHRcdG1tVG9JbmNoID0gMjUuNDtcclxuXHJcblx0XHRcdGluY2hlcyA9IHBhcnNlSW50KChtbSAvIG1tVG9JbmNoKS50b0ZpeGVkKDIpKTtcclxuXHJcblx0XHRcdHJldHVybiBpbmNoZXM7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZW5kIHJpZGVzdHlsZXIgYXBpIHJlcXVlc3RcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBlbmRwb2ludCAtIGVuZHBvaW50IGZvciByZXF1ZXN0XHJcblx0XHQgKiBAcGFyYW0ge29iamVjdHx8Zm9ybURhdGF9IGRhdGEgLSBkYXRhIHRvIGluY2x1ZGUgaW4gcmVxdWVzdFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzZW5kUmVxdWVzdChlbmRwb2ludCwgZGF0YSl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7XHJcblx0XHRcdFx0XHRhY3Rpb246IGVuZHBvaW50LFxyXG5cdFx0XHRcdFx0ZGF0YTogZGF0YSxcclxuXHRcdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbiAocmVzKSB7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSBsaXN0ZW5lciB0byBhIERPTSBFbGVtZW50XHJcblx0XHQgKiBAcGFyYW0ge0RPTUVsZW1lbnR9IGVsIC0gZG9tIGVsZW1lbnRcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBsaXN0ZW5lciAtIHR5cGUgb2YgZXZlbnQgbGlzdGVuZXJcclxuXHRcdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIC0gY2FsbGJhY2sgZnVuY3Rpb25cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYWRkTGlzdGVuZXJzKGVsLCBsaXN0ZW5lciwgY2Ipe1xyXG5cdFx0XHRpZih0eXBlb2YgZWwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGVsID09PSBcImFycmF5XCIpe1xyXG5cdFx0XHRcdGZvcihsZXQgZSBvZiBlbCl7XHJcblx0XHRcdFx0XHRlLmFkZEV2ZW50TGlzdGVuZXIobGlzdGVuZXIsIGNiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihsaXN0ZW5lciwgY2IpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBmaXJzdCBzZWxlY3QgY2hhbmdlXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gc2VsZWN0IGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gb25GaXJzdENoYW5nZShlKXtcclxuXHRcdFx0dXBkYXRlV2hlZWxPYmplY3QoZSk7XHJcblx0XHRcdGdldFdoZWVsV2lkdGhzKGUpO1xyXG5cdFx0XHRpZih3aGVlbHNbMV0uT2Zmc2V0ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdGdldENvbXBhcmVEYXRhKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIHNlY29uZCBzZWxlY3QgY2hhbmdlXHJcblx0XHQgKiBAcGFyYW0ge0RPTSBFbGVtZW50fSBlIC0gc2VsZWN0IGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gb25TZWNvbmRDaGFuZ2UoZSl7XHJcblx0XHRcdHVwZGF0ZVdoZWVsT2JqZWN0KGUpO1xyXG5cdFx0XHRnZXRXaGVlbE9mZnNldHMoZSk7XHJcblx0XHRcdGlmKHdoZWVsc1sxXS5PZmZzZXQgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0Z2V0Q29tcGFyZURhdGEoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogdGhpcmQgc2VsZWN0IGNoYW5nZVxyXG5cdFx0ICogQHBhcmFtIHtET00gRWxlbWVudH0gZSAtIHNlbGVjdCBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIG9uVGhpcmRDaGFuZ2UoZSl7XHJcblx0XHRcdHVwZGF0ZVdoZWVsT2JqZWN0KGUpO1xyXG5cdFx0XHRpZih3aGVlbHNbMV0uT2Zmc2V0ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdGdldENvbXBhcmVEYXRhKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE9uIHdpbmRvdyBsb2FkIERPTSBjb250ZW50XHJcblx0XHQgKi9cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7IFxyXG5cdFx0XHRvbkRvbVJlYWR5KCk7XHJcblx0XHRcdC8vIGluaXRpYWxpemVVaSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHdpbmRvdy5XaGVlbENhbGN1bGF0b3IgPSBXaGVlbENhbGN1bGF0b3I7XHJcbn0pKCk7XHJcbiJdfQ==
