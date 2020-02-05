(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// import Promise from 'promise-polyfill';
(function () {
  /**
   * Quick Select: Render the Quick Selct widget within a container element
   * @constructor
   * @param {number} containerId - The id of the widget's parent element
   * @param {Object} options - Optional arguments
   */
  function QuickSelect(containerId, options) {
    var vehicleModel = {},
        cdnUrl = options.devMode ? './src/' : 'https://static.ridestyler.com/widgets/quick-select/edge/',
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
      return new Promise(function (resolve) {
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
      return new Promise(function (resolve) {
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
        return new Promise(function (resolve) {
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
      return new Promise(function (resolve) {
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUE7QUFFQSxDQUFDLFlBQVk7QUFDWjs7Ozs7O0FBTUEsV0FBUyxXQUFULENBQXFCLFdBQXJCLEVBQWtDLE9BQWxDLEVBQTJDO0FBQzFDLFFBQUksWUFBWSxHQUFHLEVBQW5CO0FBQUEsUUFDQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsR0FBa0IsUUFBbEIsR0FBNkIsMERBRHZDO0FBQUEsUUFFQyxNQUFNLEdBQUcsTUFBTSxHQUFHLGFBRm5CO0FBQUEsUUFHQyxNQUFNLEdBQUcsTUFBTSxHQUFHLGdCQUhuQjtBQUFBLFFBSUMsS0FBSyxHQUFHLElBSlQ7QUFBQSxRQUtDLFNBQVMsR0FBRyxJQUxiO0FBQUEsUUFNQyxtQkFBbUIsR0FBRyxJQU52QjtBQUFBLFFBT0MsZ0JBQWdCLEdBQUcsSUFQcEI7QUFTQSxJQUFBLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBckI7QUFFQTs7OztBQUdBLGFBQVMsZ0JBQVQsR0FBMkI7QUFDMUIsTUFBQSxtQkFBbUI7QUFDbkIsTUFBQSxPQUFPLEdBQUcsSUFBVixDQUFlLFlBQVU7QUFDeEIsWUFBRyxPQUFPLENBQUMsYUFBWCxFQUEwQixVQUFVO0FBQ3BDLFFBQUEsWUFBWTtBQUNaLE9BSEQ7QUFJQTtBQUVEOzs7OztBQUdBLGFBQVMsbUJBQVQsR0FBOEI7QUFDN0IsVUFBRyxXQUFILEVBQWdCLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUFNLFdBQTdCLENBQVosQ0FBaEIsS0FDSyxPQUFPLENBQUMsS0FBUixDQUFjLHNDQUFkO0FBQ0w7QUFFRDs7Ozs7QUFHQSxhQUFTLE9BQVQsR0FBbUI7QUFDbEIsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFTLE9BQVQsRUFBaUI7QUFDbkMsWUFBSSxHQUFHLEdBQUcsSUFBSSxjQUFK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QXpDLENBQW5COztBQUVBLFVBQUcsR0FBRyxLQUFLLE1BQVIsSUFBa0IsR0FBRyxLQUFLLE9BQTdCLEVBQXFDO0FBQUU7QUFDdEMsWUFBRyxLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBZ0IsR0FBaEIsR0FBcUIsR0FBekMsQ0FBSCxFQUFpRDtBQUNoRCxVQUFBLEtBQUssQ0FBQyxXQUFOLENBQWtCLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFnQixHQUFoQixHQUFxQixHQUF6QyxFQUE4QyxhQUFoRTtBQUNBO0FBQ0QsT0FKRCxNQUlPO0FBQUU7QUFDUixZQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QixDQUFqQjtBQUNBLFFBQUEsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsVUFBeEIsRUFBb0MsSUFBcEM7QUFDQSxRQUFBLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLElBQXBDO0FBQ0EsUUFBQSxVQUFVLENBQUMsU0FBWCxHQUF1QixjQUFjLEdBQXJDO0FBQ0EsUUFBQSxZQUFZLENBQUMsU0FBYixHQUF5QixFQUF6QjtBQUNBLFFBQUEsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsVUFBekI7QUFDQTtBQUVEOztBQUVELElBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVO0FBQ3ZELE1BQUEsZ0JBQWdCO0FBQ2hCLEtBRkQ7QUFHQTs7QUFFRCxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFdBQXJCO0FBQ0EsQ0FyVkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBpbXBvcnQgUHJvbWlzZSBmcm9tICdwcm9taXNlLXBvbHlmaWxsJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogUXVpY2sgU2VsZWN0OiBSZW5kZXIgdGhlIFF1aWNrIFNlbGN0IHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFF1aWNrU2VsZWN0KGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgdmVoaWNsZU1vZGVsID0ge30sXHJcblx0XHRcdGNkblVybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL3NyYy8nIDogJ2h0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIuY29tL3dpZGdldHMvcXVpY2stc2VsZWN0L2VkZ2UvJyxcclxuXHRcdFx0dHBsVXJsID0gY2RuVXJsICsgJ2h0bWwvcXMudHBsJyxcclxuXHRcdFx0Y3NzVXJsID0gY2RuVXJsICsgJ2Nzcy9xcy5taW4uY3NzJyxcclxuXHRcdFx0dHBsRWwgPSBudWxsLFxyXG5cdFx0XHRjb250YWluZXIgPSBudWxsLFxyXG5cdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVDb25maWdJZCA9IG51bGw7XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGlmIHNwZWNpZmllZC4gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBvdXIgc2VsZWN0cy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpe1xyXG5cdFx0XHRpbml0aWFsaXplQ29udGFpbmVyKCk7XHJcblx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYob3B0aW9ucy5pbmNsdWRlU3R5bGVzKSBsb2FkU3R5bGVzKCk7XHJcblx0XHRcdFx0aW5pdGlhbGl6ZVVpKCk7XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjb250YWluZXIgZWxlbWVudFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplQ29udGFpbmVyKCl7XHJcblx0XHRcdGlmKGNvbnRhaW5lcklkKSBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGNvbnRhaW5lcklkKTtcclxuXHRcdFx0ZWxzZSBjb25zb2xlLmVycm9yKCd0aGUgcHJvdmlkZWQgY29udGFpbmVyIGlzIG5vdCB2YWxpZC4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgdGhlIFF1aWNrIFNlbGVjdCB0cGxcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFRwbCgpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHRcclxuXHRcdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRsZXQgY29tcGxldGVkID0gNDtcclxuXHRcdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gY29tcGxldGVkKSB7XHJcblx0XHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcclxuXHRcdFx0XHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcclxuXHRcdFx0XHRcdFx0XHR0cGxFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyaWRlc3R5bGVyLXF1aWNrLXNlbGVjdCcpO1xyXG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdRdWljayBTZWxlY3QgdGVtcGxhdGUgZmFpbGVkIHRvIGxvYWQuJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHJcblx0XHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHRwbFVybCwgdHJ1ZSk7XHJcblx0XHRcdFx0eGhyLnNlbmQobnVsbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCBvdXIgc3VwZXIgc3BlY2lhbCBzZWNyZXQgc3R5bGVzXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRTdHlsZXMoKSB7XHJcblx0XHRcdGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xyXG5cdFx0XHRsaW5rLmhyZWYgPSBjc3NVcmw7XHJcblx0XHRcdGxpbmsudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcblx0XHRcdGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xyXG5cdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSW5pdGlhbGl6ZSBvdXIgY3VycmVudCB2ZWhpY2xlIHNlbGVjdGlvbiBzZWxlY3RzIHdpdGggY2hhbmdlIGV2ZW50IGxpc3RlbmVyc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplVWkoKXtcclxuXHRcdFx0bGV0IHllYXJFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPXllYXJdJyksXHJcblx0XHRcdFx0bWFrZUVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9bWFrZV0nKSxcclxuXHRcdFx0XHRtb2RlbEVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9bW9kZWxdJyksXHJcblx0XHRcdFx0Y29uZmlnVGl0bGUgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCcjY29uZmlnLW1lc3NhZ2UnKTtcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuY29uZmlnVGl0bGUpIGNvbmZpZ1RpdGxlLmlubmVySFRNTCA9IG9wdGlvbnMuY29uZmlnVGl0bGU7XHJcblxyXG5cdFx0XHRsb2FkTmV4dFN0ZXAoKTtcclxuXHJcblx0XHRcdHllYXJFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0XHRtYWtlRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bW9kZWxFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgbmV4dCB2ZWhpY2xlIHNlbGVjdGlvbiBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge0V2ZW50fSBlIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkTmV4dFN0ZXAoZSl7XHJcblx0XHRcdGxldCBjdXJyZW50RWwgPSBlLFxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsLFxyXG5cdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0ID0ge1NlbGVjdGlvbjpbXX0sXHJcblx0XHRcdFx0bG9hZGVyID0gbnVsbDtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGN1cnJlbnRFbCl7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnRhcmdldCkgY3VycmVudEVsID0gY3VycmVudEVsLnRhcmdldDtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlLWxvYWRlcicpKSBjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJykpe1xyXG5cdFx0XHRcdFx0bG9hZGVyID0gY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJyk7XHJcblx0XHRcdFx0XHRsb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y3VycmVudFNlbGVjdGlvbiA9IGN1cnJlbnRFbC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuXHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dKSB7IC8vIGlmIHRoZSBzZWxlY3Rpb24gYWxyZWFkeSBleGlzdHNcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTtcclxuXHRcdFx0XHRcdHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U2VsZWN0aW9uKTtcclxuXHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIGFkZCBpdFxyXG5cdFx0XHRcdFx0dmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dID0gY3VycmVudEVsLnZhbHVlOyBcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvcihsZXQgcHJvcGVydHkgaW4gdmVoaWNsZU1vZGVsKXtcclxuXHRcdFx0XHRpZih2ZWhpY2xlTW9kZWxbcHJvcGVydHldICE9IFwiXCIpe1xyXG5cdFx0XHRcdFx0aWYocHJvcGVydHkgPT0gJ3RpcmUnKSBiZXN0VGlyZUNvbmZpZ0lkID0gdmVoaWNsZU1vZGVsW3Byb3BlcnR5XTtcclxuXHRcdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0LlNlbGVjdGlvbi5wdXNoKFxyXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eSArIFwiOlwiICsgdmVoaWNsZU1vZGVsW3Byb3BlcnR5XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGN1cnJlbnRTZWxlY3Rpb24gIT0gJ3RpcmUnKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOidWZWhpY2xlL1NlbGVjdCcsIGRhdGE6dmVoaWNsZVNlbGVjdFJlcXVlc3R9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdFx0aWYoIXZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0peyAvL2lmIGtleSBkb2Vzbid0IGFscmVhZHkgZXhpc3QgaW4gb3VyIHZlaGljbGUgbW9kZWwsIGFkZCBpdCBhbmQgcG9wdWxhdGUgdGhlIHNlbGVjdCBmaWVsZFxyXG5cdFx0XHRcdFx0XHRcdHZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMocmVzcG9uc2UuTWVudSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZihyZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbil7IC8vaWYgd2UgaGF2ZSBvdXIgQmVzdENvbmZpZ3VyYXRpb24gc2V0IHRoZW4gd2UgbmVlZCB0byBnZXQgb3VyIHRpcmUgY29uZmlnXHJcblx0XHRcdFx0XHRcdFx0YmVzdENvbmZpZ3VyYXRpb25JZCA9IHJlc3BvbnNlLkJlc3RDb25maWd1cmF0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRcdGdldFRpcmVDb25maWcoKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXQgc3RlcHMgYWZ0ZXIgY3VycmVudCBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gY3VycmVudFN0ZXAgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U3RlcCl7XHJcblx0XHRcdGxldCBjdXJyZW50SW5kZXggPSBPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2YoY3VycmVudFN0ZXApO1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHZlaGljbGVNb2RlbCkpIHtcclxuXHRcdFx0XHRpZihPYmplY3Qua2V5cyh2ZWhpY2xlTW9kZWwpLmluZGV4T2Yoa2V5KSA+IGN1cnJlbnRJbmRleCl7XHJcblx0XHRcdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsga2V5ICsgJ10nKSl7XHJcblx0XHRcdFx0XHRcdGRlc3Ryb3lGaWVsZChrZXkpO1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdmVoaWNsZU1vZGVsW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKSkgdHBsRWwucmVtb3ZlQ2hpbGQodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQb3B1bGF0ZSBhIGdpdmVuIHNlbGVjdCBmaWVsZCB3aXRoIG91ciBnaXZlbiB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMobmV3RmllbGRJbmZvLCBpc1RpcmVPcHRpb25zKXtcclxuXHRcdFx0bGV0IHNlbGVjdEVsZW1lbnQgPSBudWxsLFxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHt9O1xyXG5cclxuXHRcdFx0aWYoaXNUaXJlT3B0aW9ucyl7IC8vaWYgdGhlc2UgYXJlIHRpcmUgb3B0aW9ucyB3ZSBrbm93IHdlIG5lZWQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGQgd2l0aCBpbmZvIG5vdCBmcm9tIHRoZSBwYXNzZWQgZGF0YVxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHtLZXk6ICd0aXJlJywgTGFiZWw6ICdUaXJlIE9wdGlvbicsIENhbGxiYWNrOiBsb2FkTmV4dFN0ZXB9O1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH0gZWxzZSBpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJykpeyAvL2Vsc2UgaWYgdGhlIGZpZWxkIGFscmVhZHkgZXhpc3RzIHdlIHdhbnQgdG8gdXNlIGl0XHJcblx0XHRcdFx0c2VsZWN0RWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBuZXdGaWVsZEluZm8uS2V5ICsgJ10nKTtcclxuXHRcdFx0fSBlbHNlIHsgLy9lbHNlIHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGRcclxuXHRcdFx0XHRmaWVsZEluZm8uTGFiZWwgPSBuZXdGaWVsZEluZm8uVGl0bGU7XHJcblx0XHRcdFx0ZmllbGRJbmZvLktleSA9IG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdFx0ZmllbGRJbmZvLkNhbGxiYWNrID0gbG9hZE5leHRTdGVwO1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID4gMCl7IC8vV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG9wdGlvbnMgZmlyc3RcclxuXHRcdFx0XHRuZXdGaWVsZEluZm8uT3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbil7XHJcblx0XHRcdFx0XHRsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRpcmUgb3B0aW9uIHdlIGtub3cgdGhlIGRhdGEgaXMgZGlmZmVyZW50XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlRpcmVPcHRpb25JRDtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkZyb250LkRlc2NyaXB0aW9uO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2Ugb3B0aW9uIGRhdGEgaXMgYWx3YXlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC5pbm5lckhUTUwgPSBvcHRpb24uTGFiZWw7XHJcblx0XHRcdFx0XHRcdHNlbGVjdEVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uRWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID09IDEpIG9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTsgLy9jaGVjayBpZiB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24sIGlmIHNvIHNlbGVjdCBpdFxyXG5cdFx0XHRcdH0pO1x0XHJcblx0XHRcdH0gXHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHQvL3JlbW92ZSBsb2FkZXIgb24gc2VsZWN0IGVsZW1lbnRcclxuXHRcdFx0aWYoc2VsZWN0RWxlbWVudC52YWx1ZS5pbmRleE9mKCdTZWxlY3QnKSA9PSAtMSkgbG9hZE5leHRTdGVwKHNlbGVjdEVsZW1lbnQpOyAvL2lmIHRoZXJlIHdhcyBvbmx5IG9uZSBvcHRpb24gaXQncyBzZWxlY3RlZCwgbW92ZSB0byBuZXh0IHN0ZXAuXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZW5lcmF0ZSBhIG5ldyBmaWVsZCBnaXZlbiB0aGUgbmFtZSBhbmQgbmV3IHZhbHVlc1xyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5ld0ZpZWxkSW5mbyBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdlbmVyYXRlTmV3RmllbGQobmV3RmllbGRJbmZvKXtcclxuXHRcdFx0bGV0IG5ld0ZpZWxkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdFx0bmV3RmllbGRTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKSxcclxuXHRcdFx0XHRuZXdGaWVsZExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKSxcclxuXHRcdFx0XHRkZWZhdWx0T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyksXHJcblx0XHRcdFx0c2VsZWN0TG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5jbGFzc0xpc3QuYWRkKCdjb25maWctc2VsZWN0Jyk7XHJcblx0XHRcdGRlZmF1bHRPcHRpb24uaW5uZXJIVE1MID0gXCJTZWxlY3QgYSBcIiArIG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdG5ld0ZpZWxkTGFiZWwuaW5uZXJIVE1MID0gbmV3RmllbGRJbmZvLkxhYmVsO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBuZXdGaWVsZEluZm8uS2V5KTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe25ld0ZpZWxkSW5mby5DYWxsYmFjayhldmVudCl9KTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3QuYXBwZW5kQ2hpbGQoZGVmYXVsdE9wdGlvbik7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKG5ld0ZpZWxkTGFiZWwpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChuZXdGaWVsZFNlbGVjdCk7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKHNlbGVjdExvYWRlcik7XHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKG5ld0ZpZWxkRGl2KTtcclxuXHJcblx0XHRcdHJldHVybiBuZXdGaWVsZFNlbGVjdDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3dzIGF2YWlsYmxlIHRpcmUgY29uZmlndXJhdGlvbnMgdG8gdGhlIHVzZXJcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0VGlyZUNvbmZpZygpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjondmVoaWNsZS9nZXR0aXJlb3B0aW9uZGV0YWlscycsIGRhdGE6e1ZlaGljbGVDb25maWd1cmF0aW9uczogW2Jlc3RDb25maWd1cmF0aW9uSWRdfX0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2UgJiYgcmVzcG9uc2UuRGV0YWlscy5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWwudGlyZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHRsZXQgdGlyZU9wdGlvbnMgPSB7T3B0aW9uczogcmVzcG9uc2UuRGV0YWlsc31cclxuXHRcdFx0XHRcdFx0cG9wdWxhdGVWZWhpY2xlT3B0aW9ucyh0aXJlT3B0aW9ucywgdHJ1ZSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRidWlsZFVybCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEJ1aWxkIHRoZSB1cmwgdGhhdCB3aWxsIHRha2UgdXNlcnMgdG8gdGhlIHNob3djYXNlIHdpdGggdGhlaXIgY29uZmlndXJhdGlvbiBzZXR0aW5ncy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYnVpbGRVcmwoKXtcclxuXHRcdFx0bGV0IHVybCA9IG9wdGlvbnMudXJsO1xyXG5cclxuXHRcdFx0aWYodXJsLmluZGV4T2YoJz8nKSA9PSAtMSkgdXJsICs9ICc/JztcclxuXHRcdFx0ZWxzZSB1cmwgKz0gJyYnO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5hcGlLZXkpe1xyXG5cdFx0XHRcdHVybCArPSBvcHRpb25zLmFwaUtleSArIFwiI1wiO1xyXG5cdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRpZihiZXN0VGlyZUNvbmZpZ0lkKSB1cmwgKz0gXCImdG89XCIgKyBiZXN0VGlyZUNvbmZpZ0lkO1xyXG5cdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0XHRnZXRSU0FwaUtleSgpLnRoZW4oZnVuY3Rpb24oYXBpS2V5KXsgXHJcblx0XHRcdFx0XHRcdHVybCArPSBhcGlLZXkgKyBcIiNcIjsgXHJcblx0XHRcdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRcdFx0c2hvd0J1dHRvbih1cmwpO1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSB1c2VycyBSaWRlU3R5bGVyIGFwaSBrZXlcclxuXHRcdCAqIEByZXR1cm5zIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJTQXBpS2V5KCl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOlwiQXBpQWNjZXNzS2V5L0dldFNoYXJlZEtleVwifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UuS2V5KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3cgdGhlIGJ1dHRvbiB0aGF0IHdpbGwgZGlyZWN0IHVzZXJzIHRvIHNob3djYXNlIGdpdmVuIGEgdXJsIHRvIHRoZSBzaG93Y2FzZS5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzaG93QnV0dG9uKHVybCl7XHJcblx0XHRcdGxldCBjb25maXJtQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvblRleHQpIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gb3B0aW9ucy5idXR0b25UZXh0O1xyXG5cdFx0XHRlbHNlIGNvbmZpcm1CdXR0b24uaW5uZXJIVE1MID0gXCJTZWUgV2hlZWxzXCI7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmJ1dHRvbkNsYXNzZXMpIG9wdGlvbnMuYnV0dG9uQ2xhc3Nlcy5tYXAoYnRuQ2xhc3MgPT4gY29uZmlybUJ1dHRvbi5jbGFzc0xpc3QuYWRkKGJ0bkNsYXNzKSk7IC8vaWYgdXNlciBoYXMgc3VwZXIgc2VjcmV0IHNwZWNpYWwgYnV0dG9uIGNsYXNzZXNcclxuXHJcblx0XHRcdGNvbmZpcm1CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQoY29uZmlybUJ1dHRvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZW1vdmUgZWxlbWVudCBmcm9tIHRoZSBkb20gZ2l2ZW4gdGhlIG5hbWUgYXR0ciBvZiB0aGUgZWxlbWVudC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZGVzdHJveUZpZWxkKGtleSl7XHJcblx0XHRcdGxldCBmaWVsZEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJyk7XHJcblxyXG5cdFx0XHRpZihrZXkgIT09IFwibWFrZVwiICYmIGtleSAhPT0gXCJtb2RlbFwiKXsgLy9pZiB0aGUga2V5IGlzIG5vdCBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IGdldCByaWQgb2YgdGhlIHNlbGVjdGlvbiBjb21wbGV0ZWx5XHJcblx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpKXtcclxuXHRcdFx0XHRcdHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKS5wYXJlbnRFbGVtZW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7IC8vaWYgdGhlIGtleSBpcyBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IHJlbW92ZSB0aGUgc2VsZWN0IG9wdGlvbnNcclxuXHRcdFx0XHRsZXQgZGlzYWJsZWRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuaW5uZXJIVE1MID0gJ1NlbGVjdCBhICcgKyBrZXk7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmFwcGVuZENoaWxkKGRpc2FibGVkRWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRpbml0aWFsaXplV2lkZ2V0KCk7XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0d2luZG93LlF1aWNrU2VsZWN0ID0gUXVpY2tTZWxlY3Q7XHJcbn0pKCk7XHJcbiJdfQ==
