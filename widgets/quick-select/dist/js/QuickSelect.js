(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
        cdnUrl = options.devMode ? './src/' : 'https://static.ridestyler.com/widgets/quick-select/' + getRideStylerEnvironment() + '/',
        tplUrl = options.devMode ? './src/html/qs.tpl' : cdnUrl + 'html/qs.tpl',
        cssUrl = options.devMode ? './dist/css/qs.min.css' : cdnUrl + 'css/qs.min.css',
        tplEl = null,
        container = null,
        bestConfigurationId = null,
        bestTireConfigId = null,
        theme = null;
    options = options || {};
    /**
     * Get RideStyler environment
     */

    function getRideStylerEnvironment() {
      var url = ridestyler.ajax.url('', undefined);
      if (/\/api-alpha\./i.test(url)) return 'alpha';else if (/\/api-beta\./i.test(url)) return 'beta';else if (/\/api\./i.test(url)) return 'edge';
    }
    /**
     * Get the clients theme
     */


    function getClientTheme() {
      return ridestyler.ajax.send({
        action: 'client/GetTheme'
      }).then(function (thing) {
        if (thing && thing.Theme) {
          container.style.setProperty('--primaryColor', thing.Theme.PrimaryColor);
        }
      });
    }
    /**
     * Load our template and styles if specified. Add event listeners to our selects.
     */


    function initializeWidget() {
      initializeContainer();
      loadTpl().then(function () {
        if (options.includeStyles) {
          getClientTheme();
          loadStyles();
        }

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
          configTitle = tplEl.querySelector('#config-message'),
          selectIcon = tplEl.querySelector('.config-select-icon');
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

          if (newFieldInfo.Options.length == 1) {
            optionEl.setAttribute('selected', true); //check if there is only one option, if so select it

            if (newFieldInfo.Key != 'make' && newFieldInfo.Key != 'model') selectElement.parentElement.style.display = 'none';
          }
        });
      }

      selectElement.nextElementSibling.classList.remove('active-loader'); //remove loader on select element

      if (selectElement.length == 2) loadNextStep(selectElement); //if there was only one option move to next step.
    }
    /**
     * Generate a new field given the name and new values
     * @param {String} newFieldInfo 
     * @param {Array} options 
     */


    function generateNewField(newFieldInfo) {
      var newFieldDiv = document.createElement('div'),
          newFieldSelect = document.createElement('select'),
          defaultOption = document.createElement('option'),
          selectIcon = document.createElement('div'),
          selectLoader = document.createElement('div');
      selectLoader.classList.add('active-loader');
      selectLoader.classList.add('select-loader');
      newFieldDiv.classList.add('config-select');
      selectIcon.classList.add('config-select-icon');
      defaultOption.innerHTML = newFieldInfo.Key == 'features_pickup' ? 'Feature' : newFieldInfo.Key.charAt(0).toUpperCase() + newFieldInfo.Key.substr(1, newFieldInfo.Key.length);
      newFieldSelect.setAttribute('name', newFieldInfo.Key);
      newFieldSelect.addEventListener('change', function (event) {
        newFieldInfo.Callback(event);
      });
      newFieldSelect.appendChild(defaultOption);
      newFieldDiv.appendChild(selectIcon);
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
      if (options.buttonText) confirmButton.innerHTML = options.buttonText;else confirmButton.innerHTML = "Browse wheels";
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
        disabledEl.innerHTML = key.charAt(0).toUpperCase() + key.substr(1, key.length);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsQ0FBQyxZQUFZO0FBQ1o7Ozs7OztBQU1BLFdBQVMsV0FBVCxDQUFxQixXQUFyQixFQUFrQyxPQUFsQyxFQUEyQztBQUMxQyxRQUFJLFlBQVksR0FBRyxFQUFuQjtBQUFBLFFBQ0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFFBQWxCLEdBQTZCLHdEQUF3RCx3QkFBd0IsRUFBaEYsR0FBcUYsR0FENUg7QUFBQSxRQUVDLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBUixHQUFrQixtQkFBbEIsR0FBd0MsTUFBTSxHQUFHLGFBRjNEO0FBQUEsUUFHQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsR0FBa0IsdUJBQWxCLEdBQTRDLE1BQU0sR0FBRyxnQkFIL0Q7QUFBQSxRQUlDLEtBQUssR0FBRyxJQUpUO0FBQUEsUUFLQyxTQUFTLEdBQUcsSUFMYjtBQUFBLFFBTUMsbUJBQW1CLEdBQUcsSUFOdkI7QUFBQSxRQU9DLGdCQUFnQixHQUFHLElBUHBCO0FBQUEsUUFRQyxLQUFLLEdBQUcsSUFSVDtBQVVBLElBQUEsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFyQjtBQUVBOzs7O0FBR0EsYUFBUyx3QkFBVCxHQUFvQztBQUNuQyxVQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBWCxDQUFnQixHQUFoQixDQUFvQixFQUFwQixFQUF3QixTQUF4QixDQUFaO0FBRUEsVUFBSSxpQkFBaUIsSUFBakIsQ0FBc0IsR0FBdEIsQ0FBSixFQUFnQyxPQUFPLE9BQVAsQ0FBaEMsS0FDSyxJQUFJLGdCQUFnQixJQUFoQixDQUFxQixHQUFyQixDQUFKLEVBQStCLE9BQU8sTUFBUCxDQUEvQixLQUNBLElBQUksV0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQUosRUFBMEIsT0FBTyxNQUFQ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b3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogUXVpY2sgU2VsZWN0OiBSZW5kZXIgdGhlIFF1aWNrIFNlbGN0IHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFF1aWNrU2VsZWN0KGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgdmVoaWNsZU1vZGVsID0ge30sXHJcblx0XHRcdGNkblVybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL3NyYy8nIDogJ2h0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIuY29tL3dpZGdldHMvcXVpY2stc2VsZWN0LycgKyBnZXRSaWRlU3R5bGVyRW52aXJvbm1lbnQoKSArICcvJyxcclxuXHRcdFx0dHBsVXJsID0gb3B0aW9ucy5kZXZNb2RlID8gJy4vc3JjL2h0bWwvcXMudHBsJyA6IGNkblVybCArICdodG1sL3FzLnRwbCcsXHJcblx0XHRcdGNzc1VybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL2Rpc3QvY3NzL3FzLm1pbi5jc3MnIDogY2RuVXJsICsgJ2Nzcy9xcy5taW4uY3NzJyxcclxuXHRcdFx0dHBsRWwgPSBudWxsLFxyXG5cdFx0XHRjb250YWluZXIgPSBudWxsLFxyXG5cdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVDb25maWdJZCA9IG51bGwsXHJcblx0XHRcdHRoZW1lID0gbnVsbDtcclxuXHJcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBSaWRlU3R5bGVyIGVudmlyb25tZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJpZGVTdHlsZXJFbnZpcm9ubWVudCgpIHtcclxuXHRcdFx0Y29uc3QgdXJsID0gcmlkZXN0eWxlci5hamF4LnVybCgnJywgdW5kZWZpbmVkKTtcclxuXHRcdFxyXG5cdFx0XHRpZiAoL1xcL2FwaS1hbHBoYVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdhbHBoYSc7XHJcblx0XHRcdGVsc2UgaWYgKC9cXC9hcGktYmV0YVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdiZXRhJztcclxuXHRcdFx0ZWxzZSBpZiAoL1xcL2FwaVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdlZGdlJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgY2xpZW50cyB0aGVtZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRDbGllbnRUaGVtZSgpe1xyXG5cdFx0XHRyZXR1cm4gcmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonY2xpZW50L0dldFRoZW1lJ30pLnRoZW4odGhpbmcgPT4ge1xyXG5cdFx0XHRcdGlmKHRoaW5nICYmIHRoaW5nLlRoZW1lKXtcclxuXHRcdFx0XHRcdGNvbnRhaW5lci5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1wcmltYXJ5Q29sb3InLCB0aGluZy5UaGVtZS5QcmltYXJ5Q29sb3IpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGlmIHNwZWNpZmllZC4gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBvdXIgc2VsZWN0cy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpe1xyXG5cdFx0XHRpbml0aWFsaXplQ29udGFpbmVyKCk7XHJcblx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYob3B0aW9ucy5pbmNsdWRlU3R5bGVzKSB7XHJcblx0XHRcdFx0XHRnZXRDbGllbnRUaGVtZSgpO1xyXG5cdFx0XHRcdFx0bG9hZFN0eWxlcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpbml0aWFsaXplVWkoKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemUgb3VyIGNvbnRhaW5lciBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVDb250YWluZXIoKXtcclxuXHRcdFx0aWYoY29udGFpbmVySWQpIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnICsgY29udGFpbmVySWQpO1xyXG5cdFx0XHRlbHNlIGNvbnNvbGUuZXJyb3IoJ3RoZSBwcm92aWRlZCBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCB0aGUgUXVpY2sgU2VsZWN0IHRwbFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkVHBsKCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0bGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFxyXG5cdFx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGxldCBjb21wbGV0ZWQgPSA0O1xyXG5cdFx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBjb21wbGV0ZWQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdHRwbEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JpZGVzdHlsZXItcXVpY2stc2VsZWN0Jyk7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ1F1aWNrIFNlbGVjdCB0ZW1wbGF0ZSBmYWlsZWQgdG8gbG9hZC4nKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblx0XHRcclxuXHRcdFx0XHR4aHIub3BlbignR0VUJywgdHBsVXJsLCB0cnVlKTtcclxuXHRcdFx0XHR4aHIuc2VuZChudWxsKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciBzdXBlciBzcGVjaWFsIHNlY3JldCBzdHlsZXNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFN0eWxlcygpIHtcclxuXHRcdFx0bGV0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0XHRcdGxpbmsuaHJlZiA9IGNzc1VybDtcclxuXHRcdFx0bGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHRcdFx0bGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjdXJyZW50IHZlaGljbGUgc2VsZWN0aW9uIHNlbGVjdHMgd2l0aCBjaGFuZ2UgZXZlbnQgbGlzdGVuZXJzXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVVaSgpe1xyXG5cdFx0XHRsZXQgeWVhckVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9eWVhcl0nKSxcclxuXHRcdFx0XHRtYWtlRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tYWtlXScpLFxyXG5cdFx0XHRcdG1vZGVsRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tb2RlbF0nKSxcclxuXHRcdFx0XHRjb25maWdUaXRsZSA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJyNjb25maWctbWVzc2FnZScpLFxyXG5cdFx0XHRcdHNlbGVjdEljb24gPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCcuY29uZmlnLXNlbGVjdC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmNvbmZpZ1RpdGxlKSBjb25maWdUaXRsZS5pbm5lckhUTUwgPSBvcHRpb25zLmNvbmZpZ1RpdGxlO1xyXG5cclxuXHRcdFx0bG9hZE5leHRTdGVwKCk7XHJcblxyXG5cdFx0XHR5ZWFyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bWFrZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHRcdG1vZGVsRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG5leHQgdmVoaWNsZSBzZWxlY3Rpb24gc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtFdmVudH0gZSBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZE5leHRTdGVwKGUpe1xyXG5cdFx0XHRsZXQgY3VycmVudEVsID0gZSxcclxuXHRcdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gbnVsbCxcclxuXHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdCA9IHtTZWxlY3Rpb246W119LFxyXG5cdFx0XHRcdGxvYWRlciA9IG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjdXJyZW50RWwpe1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRFbC50YXJnZXQpIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC50YXJnZXQ7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZS1sb2FkZXInKSkgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nICYmIGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpKXtcclxuXHRcdFx0XHRcdGxvYWRlciA9IGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRcdFx0bG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBjdXJyZW50RWwuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcblxyXG5cdFx0XHRcdGlmKHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSkgeyAvLyBpZiB0aGUgc2VsZWN0aW9uIGFscmVhZHkgZXhpc3RzXHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0gPSBjdXJyZW50RWwudmFsdWU7XHJcblx0XHRcdFx0XHRyZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFNlbGVjdGlvbik7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gZWxzZSBhZGQgaXRcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTsgXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IobGV0IHByb3BlcnR5IGluIHZlaGljbGVNb2RlbCl7XHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW3Byb3BlcnR5XSAhPSBcIlwiKXtcclxuXHRcdFx0XHRcdGlmKHByb3BlcnR5ID09ICd0aXJlJykgYmVzdFRpcmVDb25maWdJZCA9IHZlaGljbGVNb2RlbFtwcm9wZXJ0eV07XHJcblx0XHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdC5TZWxlY3Rpb24ucHVzaChcclxuXHRcdFx0XHRcdFx0cHJvcGVydHkgKyBcIjpcIiArIHZlaGljbGVNb2RlbFtwcm9wZXJ0eV1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihjdXJyZW50U2VsZWN0aW9uICE9ICd0aXJlJyl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonVmVoaWNsZS9TZWxlY3QnLCBkYXRhOnZlaGljbGVTZWxlY3RSZXF1ZXN0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdGlmKCF2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldKXsgLy9pZiBrZXkgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIG91ciB2ZWhpY2xlIG1vZGVsLCBhZGQgaXQgYW5kIHBvcHVsYXRlIHRoZSBzZWxlY3QgZmllbGRcclxuXHRcdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0XHRwb3B1bGF0ZVZlaGljbGVPcHRpb25zKHJlc3BvbnNlLk1lbnUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuQmVzdENvbmZpZ3VyYXRpb24peyAvL2lmIHdlIGhhdmUgb3VyIEJlc3RDb25maWd1cmF0aW9uIHNldCB0aGVuIHdlIG5lZWQgdG8gZ2V0IG91ciB0aXJlIGNvbmZpZ1xyXG5cdFx0XHRcdFx0XHRcdGJlc3RDb25maWd1cmF0aW9uSWQgPSByZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRnZXRUaXJlQ29uZmlnKClcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGJ1aWxkVXJsKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHN0ZXBzIGFmdGVyIGN1cnJlbnQgc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGN1cnJlbnRTdGVwIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiByZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFN0ZXApe1xyXG5cdFx0XHRsZXQgY3VycmVudEluZGV4ID0gT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGN1cnJlbnRTdGVwKTtcclxuXHJcblx0XHRcdGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2ZWhpY2xlTW9kZWwpKSB7XHJcblx0XHRcdFx0aWYoT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGtleSkgPiBjdXJyZW50SW5kZXgpe1xyXG5cdFx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIGtleSArICddJykpe1xyXG5cdFx0XHRcdFx0XHRkZXN0cm95RmllbGQoa2V5KTtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHZlaGljbGVNb2RlbFtrZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3RvcignYnV0dG9uJykpIHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUG9wdWxhdGUgYSBnaXZlbiBzZWxlY3QgZmllbGQgd2l0aCBvdXIgZ2l2ZW4gdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBwb3B1bGF0ZVZlaGljbGVPcHRpb25zKG5ld0ZpZWxkSW5mbywgaXNUaXJlT3B0aW9ucyl7XHJcblx0XHRcdGxldCBzZWxlY3RFbGVtZW50ID0gbnVsbCxcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7fTtcclxuXHJcblx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRoZXNlIGFyZSB0aXJlIG9wdGlvbnMgd2Uga25vdyB3ZSBuZWVkIHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkIHdpdGggaW5mbyBub3QgZnJvbSB0aGUgcGFzc2VkIGRhdGFcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7S2V5OiAndGlyZScsIENhbGxiYWNrOiBsb2FkTmV4dFN0ZXB9O1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH0gZWxzZSBpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJykpeyAvL2Vsc2UgaWYgdGhlIGZpZWxkIGFscmVhZHkgZXhpc3RzIHdlIHdhbnQgdG8gdXNlIGl0XHJcblx0XHRcdFx0c2VsZWN0RWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBuZXdGaWVsZEluZm8uS2V5ICsgJ10nKTtcclxuXHRcdFx0fSBlbHNlIHsgLy9lbHNlIHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGRcclxuXHRcdFx0XHRmaWVsZEluZm8uTGFiZWwgPSBuZXdGaWVsZEluZm8uVGl0bGU7XHJcblx0XHRcdFx0ZmllbGRJbmZvLktleSA9IG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdFx0ZmllbGRJbmZvLkNhbGxiYWNrID0gbG9hZE5leHRTdGVwO1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID4gMCl7IC8vV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG9wdGlvbnMgZmlyc3RcclxuXHRcdFx0XHRuZXdGaWVsZEluZm8uT3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbil7XHJcblx0XHRcdFx0XHRsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRpcmUgb3B0aW9uIHdlIGtub3cgdGhlIGRhdGEgaXMgZGlmZmVyZW50XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlRpcmVPcHRpb25JRDtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkZyb250LkRlc2NyaXB0aW9uO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2Ugb3B0aW9uIGRhdGEgaXMgYWx3YXlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC5pbm5lckhUTUwgPSBvcHRpb24uTGFiZWw7XHJcblx0XHRcdFx0XHRcdHNlbGVjdEVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uRWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpOyAvL2NoZWNrIGlmIHRoZXJlIGlzIG9ubHkgb25lIG9wdGlvbiwgaWYgc28gc2VsZWN0IGl0XHJcblx0XHRcdFx0XHRcdGlmKG5ld0ZpZWxkSW5mby5LZXkgIT0gJ21ha2UnICYmIG5ld0ZpZWxkSW5mby5LZXkgIT0gJ21vZGVsJykgc2VsZWN0RWxlbWVudC5wYXJlbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHRcclxuXHRcdFx0fSBcclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1sb2FkZXInKTtcdC8vcmVtb3ZlIGxvYWRlciBvbiBzZWxlY3QgZWxlbWVudFxyXG5cdFx0XHRpZihzZWxlY3RFbGVtZW50Lmxlbmd0aCA9PSAyKSBsb2FkTmV4dFN0ZXAoc2VsZWN0RWxlbWVudCk7IC8vaWYgdGhlcmUgd2FzIG9ubHkgb25lIG9wdGlvbiBtb3ZlIHRvIG5leHQgc3RlcC5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdlbmVyYXRlIGEgbmV3IGZpZWxkIGdpdmVuIHRoZSBuYW1lIGFuZCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucyBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2VuZXJhdGVOZXdGaWVsZChuZXdGaWVsZEluZm8pe1xyXG5cdFx0XHRsZXQgbmV3RmllbGREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuXHRcdFx0XHRuZXdGaWVsZFNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpLFxyXG5cdFx0XHRcdGRlZmF1bHRPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKSxcclxuXHRcdFx0XHRzZWxlY3RJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdFx0c2VsZWN0TG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5jbGFzc0xpc3QuYWRkKCdjb25maWctc2VsZWN0Jyk7XHJcblx0XHRcdHNlbGVjdEljb24uY2xhc3NMaXN0LmFkZCgnY29uZmlnLXNlbGVjdC1pY29uJyk7XHJcblx0XHRcdGRlZmF1bHRPcHRpb24uaW5uZXJIVE1MID0gKG5ld0ZpZWxkSW5mby5LZXkgPT0gJ2ZlYXR1cmVzX3BpY2t1cCcgPyAnRmVhdHVyZScgOiBuZXdGaWVsZEluZm8uS2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmV3RmllbGRJbmZvLktleS5zdWJzdHIoMSwgbmV3RmllbGRJbmZvLktleS5sZW5ndGgpKTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgbmV3RmllbGRJbmZvLktleSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtuZXdGaWVsZEluZm8uQ2FsbGJhY2soZXZlbnQpfSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFwcGVuZENoaWxkKGRlZmF1bHRPcHRpb24pO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RJY29uKTtcclxuXHRcdFx0bmV3RmllbGREaXYuYXBwZW5kQ2hpbGQobmV3RmllbGRTZWxlY3QpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RMb2FkZXIpO1xyXG5cdFx0XHR0cGxFbC5hcHBlbmRDaGlsZChuZXdGaWVsZERpdik7XHJcblxyXG5cdFx0XHRyZXR1cm4gbmV3RmllbGRTZWxlY3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93cyBhdmFpbGJsZSB0aXJlIGNvbmZpZ3VyYXRpb25zIHRvIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFRpcmVDb25maWcoKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J3ZlaGljbGUvZ2V0dGlyZW9wdGlvbmRldGFpbHMnLCBkYXRhOntWZWhpY2xlQ29uZmlndXJhdGlvbnM6IFtiZXN0Q29uZmlndXJhdGlvbklkXX19KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlICYmIHJlc3BvbnNlLkRldGFpbHMubGVuZ3RoKXtcclxuXHRcdFx0XHRcdFx0dmVoaWNsZU1vZGVsLnRpcmUgPSAnJztcclxuXHRcdFx0XHRcdFx0bGV0IHRpcmVPcHRpb25zID0ge09wdGlvbnM6IHJlc3BvbnNlLkRldGFpbHN9XHJcblx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnModGlyZU9wdGlvbnMsIHRydWUpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0YnVpbGRVcmwoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBCdWlsZCB0aGUgdXJsIHRoYXQgd2lsbCB0YWtlIHVzZXJzIHRvIHRoZSBzaG93Y2FzZSB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGJ1aWxkVXJsKCl7XHJcblx0XHRcdGxldCB1cmwgPSBvcHRpb25zLnVybDtcclxuXHJcblx0XHRcdGlmKHVybC5pbmRleE9mKCc/JykgPT0gLTEpIHVybCArPSAnPyc7XHJcblx0XHRcdGVsc2UgdXJsICs9ICcmJztcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuYXBpS2V5KXtcclxuXHRcdFx0XHR1cmwgKz0gb3B0aW9ucy5hcGlLZXkgKyBcIiNcIjtcclxuXHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHRcdFx0XHRzaG93QnV0dG9uKHVybCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdFx0Z2V0UlNBcGlLZXkoKS50aGVuKGZ1bmN0aW9uKGFwaUtleSl7IFxyXG5cdFx0XHRcdFx0XHR1cmwgKz0gYXBpS2V5ICsgXCIjXCI7IFxyXG5cdFx0XHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0XHRcdGlmKGJlc3RUaXJlQ29uZmlnSWQpIHVybCArPSBcIiZ0bz1cIiArIGJlc3RUaXJlQ29uZmlnSWQ7XHJcblx0XHRcdFx0XHRcdHNob3dCdXR0b24odXJsKTtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgdXNlcnMgUmlkZVN0eWxlciBhcGkga2V5XHJcblx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRSU0FwaUtleSgpe1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjpcIkFwaUFjY2Vzc0tleS9HZXRTaGFyZWRLZXlcIn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0aWYocmVzcG9uc2Upe1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlLktleSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93IHRoZSBidXR0b24gdGhhdCB3aWxsIGRpcmVjdCB1c2VycyB0byBzaG93Y2FzZSBnaXZlbiBhIHVybCB0byB0aGUgc2hvd2Nhc2UuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gc2hvd0J1dHRvbih1cmwpe1xyXG5cdFx0XHRsZXQgY29uZmlybUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25UZXh0KSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IG9wdGlvbnMuYnV0dG9uVGV4dDtcclxuXHRcdFx0ZWxzZSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IFwiQnJvd3NlIHdoZWVsc1wiO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25DbGFzc2VzKSBvcHRpb25zLmJ1dHRvbkNsYXNzZXMubWFwKGJ0bkNsYXNzID0+IGNvbmZpcm1CdXR0b24uY2xhc3NMaXN0LmFkZChidG5DbGFzcykpOyAvL2lmIHVzZXIgaGFzIHN1cGVyIHNlY3JldCBzcGVjaWFsIGJ1dHRvbiBjbGFzc2VzXHJcblxyXG5cdFx0XHRjb25maXJtQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHR3aW5kb3cub3Blbih1cmwpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKGNvbmZpcm1CdXR0b24pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVtb3ZlIGVsZW1lbnQgZnJvbSB0aGUgZG9tIGdpdmVuIHRoZSBuYW1lIGF0dHIgb2YgdGhlIGVsZW1lbnQuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGRlc3Ryb3lGaWVsZChrZXkpe1xyXG5cdFx0XHRsZXQgZmllbGRFbGVtZW50ID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpO1xyXG5cclxuXHRcdFx0aWYoa2V5ICE9PSBcIm1ha2VcIiAmJiBrZXkgIT09IFwibW9kZWxcIil7IC8vaWYgdGhlIGtleSBpcyBub3QgbWFrZSBvciBtb2RlbCwgd2UganVzdCBnZXQgcmlkIG9mIHRoZSBzZWxlY3Rpb24gY29tcGxldGVseVxyXG5cdFx0XHRcdGlmKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKSl7XHJcblx0XHRcdFx0XHR0cGxFbC5yZW1vdmVDaGlsZCh0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJykucGFyZW50RWxlbWVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgeyAvL2lmIHRoZSBrZXkgaXMgbWFrZSBvciBtb2RlbCwgd2UganVzdCByZW1vdmUgdGhlIHNlbGVjdCBvcHRpb25zXHJcblx0XHRcdFx0bGV0IGRpc2FibGVkRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRkaXNhYmxlZEVsLmlubmVySFRNTCA9IGtleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zdWJzdHIoMSwga2V5Lmxlbmd0aCk7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcblx0XHRcdFx0ZmllbGRFbGVtZW50LmFwcGVuZENoaWxkKGRpc2FibGVkRWwpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRpbml0aWFsaXplV2lkZ2V0KCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHdpbmRvdy5RdWlja1NlbGVjdCA9IFF1aWNrU2VsZWN0O1xyXG59KSgpO1xyXG4iXX0=
