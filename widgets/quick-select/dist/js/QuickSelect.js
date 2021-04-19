(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  /**
   * Quick Select: Render the Quick Selct widget within a container element
   * @constructor
   * @param {number} containerId - The id of the widget's parent element
   * @param {Object} [options] - Optional arguments
   * @param {string[]} [options.buttonClasses]
   * @param {boolean} [options.includeStyles]
   * @param {string} [options.configTitle]
   * @param {boolean} [options.devMode]
   * @param {string} [options.apiKey]
   * @param {string} [options.url]
   * @param {Function} [options.callback]
   * @param {Function} [options.openInSamePage]
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
        bestTireOptionDetails = null,
        tireOptionDetailsLookup = {},
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

        if (currentSelection !== 'year' && currentSelection !== 'make') addStaticLoader();
      }

      for (var property in vehicleModel) {
        if (vehicleModel[property] != "") {
          if (property == 'tire') {
            bestTireConfigId = vehicleModel[property];
            bestTireOptionDetails = tireOptionDetailsLookup[bestTireConfigId];
          }

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
        updateButton();
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

      if (tplEl.querySelector('a')) tplEl.removeChild(tplEl.querySelector('a'));
    }

    function addStaticLoader() {
      removeStaticLoader();
      var staticLoader = document.createElement('div');
      staticLoader.className = "select-loader static-loader";
      tplEl.appendChild(staticLoader);
    }

    function removeStaticLoader() {
      tplEl.querySelectorAll('.static-loader').forEach(function (el) {
        return el.parentElement.removeChild(el);
      });
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
      else removeStaticLoader();
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
      newFieldDiv.appendChild(newFieldSelect);
      newFieldDiv.appendChild(selectLoader);
      newFieldDiv.appendChild(selectIcon);
      tplEl.appendChild(newFieldDiv);
      return newFieldSelect;
    }
    /**
     * Shows availble tire configurations to the user
     */


    function getTireConfig() {
      return ridestyler.ajax.send({
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
          tireOptionDetailsLookup = {};
          response.Details.forEach(function (detail) {
            tireOptionDetailsLookup[detail.TireOptionID] = detail;
          });
          populateVehicleOptions(tireOptions, true);
        } else {
          updateButton();
        }
      });
    }
    /**
     * Build the data that will take users to the showcase with their configuration settings.
     */


    function updateButton() {
      var url = options.url || '';
      if (url.indexOf('?') == -1) url += '?';else url += '&';
      var data = bestTireOptionDetails ? bestTireOptionDetails : {
        ConfigurationID: bestConfigurationId
      };

      if (options.apiKey) {
        url += options.apiKey + "#";
        if (bestConfigurationId) url += "vc=" + bestConfigurationId;
        if (bestTireConfigId) url += "&to=" + bestTireConfigId;
        showButton(url, data);
      } else {
        getRSApiKey().then(function (apiKey) {
          url += apiKey + "#";
          if (bestConfigurationId) url += "vc=" + bestConfigurationId;
          if (bestTireConfigId) url += "&to=" + bestTireConfigId;
          showButton(url, data);
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


    function showButton(url, data) {
      removeStaticLoader();
      var confirmButton = document.createElement('a');
      confirmButton.href = url;
      if (!options.openInSamePage) confirmButton.target = '_blank';
      if (options.buttonText) confirmButton.innerHTML = options.buttonText;else confirmButton.innerHTML = "Browse wheels";
      if (options.buttonClasses) options.buttonClasses.map(function (btnClass) {
        return confirmButton.classList.add(btnClass);
      }); //if user has super secret special button classes

      confirmButton.addEventListener('click', function (e) {
        if (typeof options.callback !== 'function') return;
        options.callback(data);
        e.preventDefault();
        return false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0Ryb3Bib3ggKFJpZGVTdHlsZXIpL0J1cmtzb24vY29tLmJ1cmtzb24ucmlkZXN0eWxlci53aWRnZXRzL3dpZGdldHMvcXVpY2stc2VsZWN0L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLENBQUMsWUFBWTtBQUNaO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQyxXQUFTLFdBQVQsQ0FBcUIsV0FBckIsRUFBa0MsT0FBbEMsRUFBMkM7QUFDMUMsUUFBSSxZQUFZLEdBQUcsRUFBbkI7QUFBQSxRQUNDLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBUixHQUFrQixRQUFsQixHQUE2Qix3REFBd0Qsd0JBQXdCLEVBQWhGLEdBQXFGLEdBRDVIO0FBQUEsUUFFQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsR0FBa0IsbUJBQWxCLEdBQXdDLE1BQU0sR0FBRyxhQUYzRDtBQUFBLFFBR0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLHVCQUFsQixHQUE0QyxNQUFNLEdBQUcsZ0JBSC9EO0FBQUEsUUFJQyxLQUFLLEdBQUcsSUFKVDtBQUFBLFFBS0MsU0FBUyxHQUFHLElBTGI7QUFBQSxRQU1DLG1CQUFtQixHQUFHLElBTnZCO0FBQUEsUUFPQyxnQkFBZ0IsR0FBRyxJQVBwQjtBQUFBLFFBUUMscUJBQXFCLEdBQUcsSUFSekI7QUFBQSxRQVNDLHVCQUF1QixHQUFHLEVBVDNCO0FBQUEsUUFVQyxLQUFLLEdBQUcsSUFWVDtBQVlBLElBQUEsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFyQjtBQUVBO0FBQ0Y7QUFDQTs7QUFDRSxhQUFTLHdCQUFULEdBQW9DO0FBQ25DLFVBQU0sR0FBRyxHQUFHLFVBQVUsQ0FB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S0FBOEIsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFYLEVBQWMsR0FBRyxDQUFDLE1BQWxCLENBQXJEO0FBQ0EsUUFBQSxZQUFZLENBQUMsU0FBYixHQUF5QixFQUF6QjtBQUNBLFFBQUEsWUFBWSxDQUFDLFdBQWIsQ0FBeUIsVUFBekI7QUFDQTtBQUVEOztBQUVELElBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVO0FBQ3ZELE1BQUEsZ0JBQWdCO0FBQ2hCLEtBRkQ7QUFHQTs7QUFFRCxFQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLFdBQXJCO0FBQ0EsQ0F0YUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIoZnVuY3Rpb24gKCkge1xyXG5cdC8qKlxyXG5cdCAqIFF1aWNrIFNlbGVjdDogUmVuZGVyIHRoZSBRdWljayBTZWxjdCB3aWRnZXQgd2l0aGluIGEgY29udGFpbmVyIGVsZW1lbnRcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gY29udGFpbmVySWQgLSBUaGUgaWQgb2YgdGhlIHdpZGdldCdzIHBhcmVudCBlbGVtZW50XHJcblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbmFsIGFyZ3VtZW50c1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRpb25zLmJ1dHRvbkNsYXNzZXNdXHJcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmNsdWRlU3R5bGVzXVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jb25maWdUaXRsZV1cclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRldk1vZGVdXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmFwaUtleV1cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudXJsXVxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLmNhbGxiYWNrXVxyXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9wZW5JblNhbWVQYWdlXVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFF1aWNrU2VsZWN0KGNvbnRhaW5lcklkLCBvcHRpb25zKSB7XHJcblx0XHRsZXQgdmVoaWNsZU1vZGVsID0ge30sXHJcblx0XHRcdGNkblVybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL3NyYy8nIDogJ2h0dHBzOi8vc3RhdGljLnJpZGVzdHlsZXIuY29tL3dpZGdldHMvcXVpY2stc2VsZWN0LycgKyBnZXRSaWRlU3R5bGVyRW52aXJvbm1lbnQoKSArICcvJyxcclxuXHRcdFx0dHBsVXJsID0gb3B0aW9ucy5kZXZNb2RlID8gJy4vc3JjL2h0bWwvcXMudHBsJyA6IGNkblVybCArICdodG1sL3FzLnRwbCcsXHJcblx0XHRcdGNzc1VybCA9IG9wdGlvbnMuZGV2TW9kZSA/ICcuL2Rpc3QvY3NzL3FzLm1pbi5jc3MnIDogY2RuVXJsICsgJ2Nzcy9xcy5taW4uY3NzJyxcclxuXHRcdFx0dHBsRWwgPSBudWxsLFxyXG5cdFx0XHRjb250YWluZXIgPSBudWxsLFxyXG5cdFx0XHRiZXN0Q29uZmlndXJhdGlvbklkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVDb25maWdJZCA9IG51bGwsXHJcblx0XHRcdGJlc3RUaXJlT3B0aW9uRGV0YWlscyA9IG51bGwsXHJcblx0XHRcdHRpcmVPcHRpb25EZXRhaWxzTG9va3VwID0ge30sXHJcblx0XHRcdHRoZW1lID0gbnVsbDtcclxuXHJcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBSaWRlU3R5bGVyIGVudmlyb25tZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJpZGVTdHlsZXJFbnZpcm9ubWVudCgpIHtcclxuXHRcdFx0Y29uc3QgdXJsID0gcmlkZXN0eWxlci5hamF4LnVybCgnJywgdW5kZWZpbmVkKTtcclxuXHRcdFxyXG5cdFx0XHRpZiAoL1xcL2FwaS1hbHBoYVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdhbHBoYSc7XHJcblx0XHRcdGVsc2UgaWYgKC9cXC9hcGktYmV0YVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdiZXRhJztcclxuXHRcdFx0ZWxzZSBpZiAoL1xcL2FwaVxcLi9pLnRlc3QodXJsKSkgcmV0dXJuICdlZGdlJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgY2xpZW50cyB0aGVtZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRDbGllbnRUaGVtZSgpe1xyXG5cdFx0XHRyZXR1cm4gcmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonY2xpZW50L0dldFRoZW1lJ30pLnRoZW4odGhpbmcgPT4ge1xyXG5cdFx0XHRcdGlmKHRoaW5nICYmIHRoaW5nLlRoZW1lKXtcclxuXHRcdFx0XHRcdGNvbnRhaW5lci5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1wcmltYXJ5Q29sb3InLCB0aGluZy5UaGVtZS5QcmltYXJ5Q29sb3IpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciB0ZW1wbGF0ZSBhbmQgc3R5bGVzIGlmIHNwZWNpZmllZC4gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBvdXIgc2VsZWN0cy5cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVdpZGdldCgpe1xyXG5cdFx0XHRpbml0aWFsaXplQ29udGFpbmVyKCk7XHJcblx0XHRcdGxvYWRUcGwoKS50aGVuKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0aWYob3B0aW9ucy5pbmNsdWRlU3R5bGVzKSB7XHJcblx0XHRcdFx0XHRnZXRDbGllbnRUaGVtZSgpO1xyXG5cdFx0XHRcdFx0bG9hZFN0eWxlcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpbml0aWFsaXplVWkoKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemUgb3VyIGNvbnRhaW5lciBlbGVtZW50XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVDb250YWluZXIoKXtcclxuXHRcdFx0aWYoY29udGFpbmVySWQpIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnICsgY29udGFpbmVySWQpO1xyXG5cdFx0XHRlbHNlIGNvbnNvbGUuZXJyb3IoJ3RoZSBwcm92aWRlZCBjb250YWluZXIgaXMgbm90IHZhbGlkLicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9hZCB0aGUgUXVpY2sgU2VsZWN0IHRwbFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkVHBsKCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0bGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cdFxyXG5cdFx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGxldCBjb21wbGV0ZWQgPSA0O1xyXG5cdFx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBjb21wbGV0ZWQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbm5lckhUTUwgPSB4aHIucmVzcG9uc2VUZXh0O1xyXG5cdFx0XHRcdFx0XHRcdHRwbEVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JpZGVzdHlsZXItcXVpY2stc2VsZWN0Jyk7XHJcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ1F1aWNrIFNlbGVjdCB0ZW1wbGF0ZSBmYWlsZWQgdG8gbG9hZC4nKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblx0XHRcclxuXHRcdFx0XHR4aHIub3BlbignR0VUJywgdHBsVXJsLCB0cnVlKTtcclxuXHRcdFx0XHR4aHIuc2VuZChudWxsKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG91ciBzdXBlciBzcGVjaWFsIHNlY3JldCBzdHlsZXNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZFN0eWxlcygpIHtcclxuXHRcdFx0bGV0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcblx0XHRcdGxpbmsuaHJlZiA9IGNzc1VybDtcclxuXHRcdFx0bGluay50eXBlID0gJ3RleHQvY3NzJztcclxuXHRcdFx0bGluay5yZWwgPSAnc3R5bGVzaGVldCc7XHJcblx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJbml0aWFsaXplIG91ciBjdXJyZW50IHZlaGljbGUgc2VsZWN0aW9uIHNlbGVjdHMgd2l0aCBjaGFuZ2UgZXZlbnQgbGlzdGVuZXJzXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGluaXRpYWxpemVVaSgpe1xyXG5cdFx0XHRsZXQgeWVhckVsID0gdHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9eWVhcl0nKSxcclxuXHRcdFx0XHRtYWtlRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tYWtlXScpLFxyXG5cdFx0XHRcdG1vZGVsRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1tb2RlbF0nKSxcclxuXHRcdFx0XHRjb25maWdUaXRsZSA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJyNjb25maWctbWVzc2FnZScpLFxyXG5cdFx0XHRcdHNlbGVjdEljb24gPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCcuY29uZmlnLXNlbGVjdC1pY29uJyk7XHJcblxyXG5cdFx0XHRpZihvcHRpb25zLmNvbmZpZ1RpdGxlKSBjb25maWdUaXRsZS5pbm5lckhUTUwgPSBvcHRpb25zLmNvbmZpZ1RpdGxlO1xyXG5cclxuXHRcdFx0bG9hZE5leHRTdGVwKCk7XHJcblxyXG5cdFx0XHR5ZWFyRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bWFrZUVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtsb2FkTmV4dFN0ZXAoZXZlbnQpfSk7XHJcblx0XHRcdG1vZGVsRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIG5leHQgdmVoaWNsZSBzZWxlY3Rpb24gc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtFdmVudH0gZSBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gbG9hZE5leHRTdGVwKGUpe1xyXG5cdFx0XHRsZXQgY3VycmVudEVsID0gZSxcclxuXHRcdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gbnVsbCxcclxuXHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdCA9IHtTZWxlY3Rpb246W119LFxyXG5cdFx0XHRcdGxvYWRlciA9IG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjdXJyZW50RWwpe1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRFbC50YXJnZXQpIGN1cnJlbnRFbCA9IGN1cnJlbnRFbC50YXJnZXQ7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZS1sb2FkZXInKSkgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nICYmIGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpKXtcclxuXHRcdFx0XHRcdGxvYWRlciA9IGN1cnJlbnRFbC5wYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRcdFx0bG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBjdXJyZW50RWwuZ2V0QXR0cmlidXRlKCduYW1lJyk7XHJcblxyXG5cdFx0XHRcdGlmKHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSkgeyAvLyBpZiB0aGUgc2VsZWN0aW9uIGFscmVhZHkgZXhpc3RzXHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbY3VycmVudFNlbGVjdGlvbl0gPSBjdXJyZW50RWwudmFsdWU7XHJcblx0XHRcdFx0XHRyZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFNlbGVjdGlvbik7XHJcblx0XHRcdFx0fSBlbHNlIHsgLy8gZWxzZSBhZGQgaXRcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTsgXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAoY3VycmVudFNlbGVjdGlvbiAhPT0gJ3llYXInICYmIGN1cnJlbnRTZWxlY3Rpb24gIT09ICdtYWtlJylcclxuXHRcdFx0XHRcdGFkZFN0YXRpY0xvYWRlcigpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IobGV0IHByb3BlcnR5IGluIHZlaGljbGVNb2RlbCl7XHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW3Byb3BlcnR5XSAhPSBcIlwiKXtcclxuXHRcdFx0XHRcdGlmKHByb3BlcnR5ID09ICd0aXJlJykge1xyXG5cdFx0XHRcdFx0XHRiZXN0VGlyZUNvbmZpZ0lkID0gdmVoaWNsZU1vZGVsW3Byb3BlcnR5XTtcclxuXHRcdFx0XHRcdFx0YmVzdFRpcmVPcHRpb25EZXRhaWxzID0gdGlyZU9wdGlvbkRldGFpbHNMb29rdXBbYmVzdFRpcmVDb25maWdJZF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2ZWhpY2xlU2VsZWN0UmVxdWVzdC5TZWxlY3Rpb24ucHVzaChcclxuXHRcdFx0XHRcdFx0cHJvcGVydHkgKyBcIjpcIiArIHZlaGljbGVNb2RlbFtwcm9wZXJ0eV1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZihjdXJyZW50U2VsZWN0aW9uICE9ICd0aXJlJyl7XHJcblx0XHRcdFx0cmlkZXN0eWxlci5hamF4LnNlbmQoe2FjdGlvbjonVmVoaWNsZS9TZWxlY3QnLCBkYXRhOnZlaGljbGVTZWxlY3RSZXF1ZXN0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdGlmKCF2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldKXsgLy9pZiBrZXkgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIG91ciB2ZWhpY2xlIG1vZGVsLCBhZGQgaXQgYW5kIHBvcHVsYXRlIHRoZSBzZWxlY3QgZmllbGRcclxuXHRcdFx0XHRcdFx0XHR2ZWhpY2xlTW9kZWxbcmVzcG9uc2UuTWVudS5LZXldID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0XHRwb3B1bGF0ZVZlaGljbGVPcHRpb25zKHJlc3BvbnNlLk1lbnUpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYocmVzcG9uc2UuQmVzdENvbmZpZ3VyYXRpb24peyAvL2lmIHdlIGhhdmUgb3VyIEJlc3RDb25maWd1cmF0aW9uIHNldCB0aGVuIHdlIG5lZWQgdG8gZ2V0IG91ciB0aXJlIGNvbmZpZ1xyXG5cdFx0XHRcdFx0XHRcdGJlc3RDb25maWd1cmF0aW9uSWQgPSByZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0XHRnZXRUaXJlQ29uZmlnKClcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHVwZGF0ZUJ1dHRvbigpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXNldCBzdGVwcyBhZnRlciBjdXJyZW50IHN0ZXBcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBjdXJyZW50U3RlcCBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gcmVzZXRTdGVwc0FmdGVyKGN1cnJlbnRTdGVwKXtcclxuXHRcdFx0bGV0IGN1cnJlbnRJbmRleCA9IE9iamVjdC5rZXlzKHZlaGljbGVNb2RlbCkuaW5kZXhPZihjdXJyZW50U3RlcCk7XHJcblxyXG5cdFx0XHRmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXModmVoaWNsZU1vZGVsKSkge1xyXG5cdFx0XHRcdGlmKE9iamVjdC5rZXlzKHZlaGljbGVNb2RlbCkuaW5kZXhPZihrZXkpID4gY3VycmVudEluZGV4KXtcclxuXHRcdFx0XHRcdGlmKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBrZXkgKyAnXScpKXtcclxuXHRcdFx0XHRcdFx0ZGVzdHJveUZpZWxkKGtleSk7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB2ZWhpY2xlTW9kZWxba2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKSkgdHBsRWwucmVtb3ZlQ2hpbGQodHBsRWwucXVlcnlTZWxlY3RvcignYScpKVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGFkZFN0YXRpY0xvYWRlcigpIHtcclxuXHRcdFx0cmVtb3ZlU3RhdGljTG9hZGVyKCk7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgc3RhdGljTG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0XHRzdGF0aWNMb2FkZXIuY2xhc3NOYW1lID0gXCJzZWxlY3QtbG9hZGVyIHN0YXRpYy1sb2FkZXJcIjtcclxuXHRcdFx0XHJcblx0XHRcdHRwbEVsLmFwcGVuZENoaWxkKHN0YXRpY0xvYWRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gcmVtb3ZlU3RhdGljTG9hZGVyKCkge1xyXG5cdFx0XHR0cGxFbC5xdWVyeVNlbGVjdG9yQWxsKCcuc3RhdGljLWxvYWRlcicpLmZvckVhY2goZWwgPT4gZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUG9wdWxhdGUgYSBnaXZlbiBzZWxlY3QgZmllbGQgd2l0aCBvdXIgZ2l2ZW4gdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBwb3B1bGF0ZVZlaGljbGVPcHRpb25zKG5ld0ZpZWxkSW5mbywgaXNUaXJlT3B0aW9ucyl7XHJcblx0XHRcdGxldCBzZWxlY3RFbGVtZW50ID0gbnVsbCxcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7fTtcclxuXHJcblxyXG5cdFx0XHRpZihpc1RpcmVPcHRpb25zKXsgLy9pZiB0aGVzZSBhcmUgdGlyZSBvcHRpb25zIHdlIGtub3cgd2UgbmVlZCB0byBnZW5lcmF0ZSBhIG5ldyBmaWVsZCB3aXRoIGluZm8gbm90IGZyb20gdGhlIHBhc3NlZCBkYXRhXHJcblx0XHRcdFx0ZmllbGRJbmZvID0ge0tleTogJ3RpcmUnLCBDYWxsYmFjazogbG9hZE5leHRTdGVwfTtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9IGVsc2UgaWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIG5ld0ZpZWxkSW5mby5LZXkgKyAnXScpKXsgLy9lbHNlIGlmIHRoZSBmaWVsZCBhbHJlYWR5IGV4aXN0cyB3ZSB3YW50IHRvIHVzZSBpdFxyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJyk7XHJcblx0XHRcdH0gZWxzZSB7IC8vZWxzZSB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkXHJcblx0XHRcdFx0ZmllbGRJbmZvLkxhYmVsID0gbmV3RmllbGRJbmZvLlRpdGxlO1xyXG5cdFx0XHRcdGZpZWxkSW5mby5LZXkgPSBuZXdGaWVsZEluZm8uS2V5O1xyXG5cdFx0XHRcdGZpZWxkSW5mby5DYWxsYmFjayA9IGxvYWROZXh0U3RlcDtcclxuXHRcdFx0XHRzZWxlY3RFbGVtZW50ID0gZ2VuZXJhdGVOZXdGaWVsZChmaWVsZEluZm8pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuXHJcblx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA+IDApeyAvL1dlIHdhbnQgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBvcHRpb25zIGZpcnN0XHJcblx0XHRcdFx0bmV3RmllbGRJbmZvLk9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbihvcHRpb24pe1xyXG5cdFx0XHRcdFx0bGV0IG9wdGlvbkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcblx0XHRcdFx0XHRpZihpc1RpcmVPcHRpb25zKXsgLy9pZiB0aXJlIG9wdGlvbiB3ZSBrbm93IHRoZSBkYXRhIGlzIGRpZmZlcmVudFxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5UaXJlT3B0aW9uSUQ7XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLmlubmVySFRNTCA9IG9wdGlvbi5Gcm9udC5EZXNjcmlwdGlvbjtcclxuXHRcdFx0XHRcdFx0c2VsZWN0RWxlbWVudC5hcHBlbmRDaGlsZChvcHRpb25FbCk7XHJcblx0XHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIG9wdGlvbiBkYXRhIGlzIGFsd2F5cyB0aGUgc2FtZVxyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC52YWx1ZSA9IG9wdGlvbi5WYWx1ZTtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkxhYmVsO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmKG5ld0ZpZWxkSW5mby5PcHRpb25zLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCB0cnVlKTsgLy9jaGVjayBpZiB0aGVyZSBpcyBvbmx5IG9uZSBvcHRpb24sIGlmIHNvIHNlbGVjdCBpdFxyXG5cdFx0XHRcdFx0XHRpZihuZXdGaWVsZEluZm8uS2V5ICE9ICdtYWtlJyAmJiBuZXdGaWVsZEluZm8uS2V5ICE9ICdtb2RlbCcpIHNlbGVjdEVsZW1lbnQucGFyZW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1x0XHJcblx0XHRcdH0gXHJcblxyXG5cdFx0XHRzZWxlY3RFbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtbG9hZGVyJyk7XHQvL3JlbW92ZSBsb2FkZXIgb24gc2VsZWN0IGVsZW1lbnRcclxuXHRcdFx0aWYoc2VsZWN0RWxlbWVudC5sZW5ndGggPT0gMikgbG9hZE5leHRTdGVwKHNlbGVjdEVsZW1lbnQpOyAvL2lmIHRoZXJlIHdhcyBvbmx5IG9uZSBvcHRpb24gbW92ZSB0byBuZXh0IHN0ZXAuXHJcblx0XHRcdGVsc2UgcmVtb3ZlU3RhdGljTG9hZGVyKCk7XHRcdFx0XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZW5lcmF0ZSBhIG5ldyBmaWVsZCBnaXZlbiB0aGUgbmFtZSBhbmQgbmV3IHZhbHVlc1xyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5ld0ZpZWxkSW5mbyBcclxuXHRcdCAqIEBwYXJhbSB7QXJyYXl9IG9wdGlvbnMgXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdlbmVyYXRlTmV3RmllbGQobmV3RmllbGRJbmZvKXtcclxuXHRcdFx0bGV0IG5ld0ZpZWxkRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdFx0bmV3RmllbGRTZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKSxcclxuXHRcdFx0XHRkZWZhdWx0T3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyksXHJcblx0XHRcdFx0c2VsZWN0SWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxyXG5cdFx0XHRcdHNlbGVjdExvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0c2VsZWN0TG9hZGVyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdC1sb2FkZXInKTtcclxuXHRcdFx0bmV3RmllbGREaXYuY2xhc3NMaXN0LmFkZCgnY29uZmlnLXNlbGVjdCcpO1xyXG5cdFx0XHRzZWxlY3RJY29uLmNsYXNzTGlzdC5hZGQoJ2NvbmZpZy1zZWxlY3QtaWNvbicpO1xyXG5cdFx0XHRkZWZhdWx0T3B0aW9uLmlubmVySFRNTCA9IChuZXdGaWVsZEluZm8uS2V5ID09ICdmZWF0dXJlc19waWNrdXAnID8gJ0ZlYXR1cmUnIDogbmV3RmllbGRJbmZvLktleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5ld0ZpZWxkSW5mby5LZXkuc3Vic3RyKDEsIG5ld0ZpZWxkSW5mby5LZXkubGVuZ3RoKSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LnNldEF0dHJpYnV0ZSgnbmFtZScsIG5ld0ZpZWxkSW5mby5LZXkpO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bmV3RmllbGRJbmZvLkNhbGxiYWNrKGV2ZW50KX0pO1xyXG5cdFx0XHRuZXdGaWVsZFNlbGVjdC5hcHBlbmRDaGlsZChkZWZhdWx0T3B0aW9uKTtcclxuXHRcdFx0bmV3RmllbGREaXYuYXBwZW5kQ2hpbGQobmV3RmllbGRTZWxlY3QpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RMb2FkZXIpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChzZWxlY3RJY29uKTtcclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQobmV3RmllbGREaXYpO1xyXG5cclxuXHRcdFx0cmV0dXJuIG5ld0ZpZWxkU2VsZWN0O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2hvd3MgYXZhaWxibGUgdGlyZSBjb25maWd1cmF0aW9ucyB0byB0aGUgdXNlclxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBnZXRUaXJlQ29uZmlnKCl7XHJcblx0XHRcdHJldHVybiByaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOid2ZWhpY2xlL2dldHRpcmVvcHRpb25kZXRhaWxzJywgZGF0YTp7VmVoaWNsZUNvbmZpZ3VyYXRpb25zOiBbYmVzdENvbmZpZ3VyYXRpb25JZF19fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0aWYocmVzcG9uc2UgJiYgcmVzcG9uc2UuRGV0YWlscy5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0dmVoaWNsZU1vZGVsLnRpcmUgPSAnJztcclxuXHJcblx0XHRcdFx0XHRsZXQgdGlyZU9wdGlvbnMgPSB7T3B0aW9uczogcmVzcG9uc2UuRGV0YWlsc31cclxuXHJcblx0XHRcdFx0XHR0aXJlT3B0aW9uRGV0YWlsc0xvb2t1cCA9IHt9O1xyXG5cdFx0XHRcdFx0cmVzcG9uc2UuRGV0YWlscy5mb3JFYWNoKGRldGFpbCA9PiB7XHJcblx0XHRcdFx0XHRcdHRpcmVPcHRpb25EZXRhaWxzTG9va3VwW2RldGFpbC5UaXJlT3B0aW9uSURdID0gZGV0YWlsO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0cG9wdWxhdGVWZWhpY2xlT3B0aW9ucyh0aXJlT3B0aW9ucywgdHJ1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHVwZGF0ZUJ1dHRvbigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBCdWlsZCB0aGUgZGF0YSB0aGF0IHdpbGwgdGFrZSB1c2VycyB0byB0aGUgc2hvd2Nhc2Ugd2l0aCB0aGVpciBjb25maWd1cmF0aW9uIHNldHRpbmdzLlxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiB1cGRhdGVCdXR0b24oKXtcclxuXHRcdFx0bGV0IHVybCA9IG9wdGlvbnMudXJsIHx8ICcnO1xyXG5cclxuXHRcdFx0aWYodXJsLmluZGV4T2YoJz8nKSA9PSAtMSkgdXJsICs9ICc/JztcclxuXHRcdFx0ZWxzZSB1cmwgKz0gJyYnO1xyXG5cclxuXHRcdFx0Y29uc3QgZGF0YSA9IGJlc3RUaXJlT3B0aW9uRGV0YWlscyA/IGJlc3RUaXJlT3B0aW9uRGV0YWlscyA6IHtcclxuXHRcdFx0XHRDb25maWd1cmF0aW9uSUQ6IGJlc3RDb25maWd1cmF0aW9uSWRcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuYXBpS2V5KXtcclxuXHRcdFx0XHR1cmwgKz0gb3B0aW9ucy5hcGlLZXkgKyBcIiNcIjtcclxuXHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0aWYoYmVzdFRpcmVDb25maWdJZCkgdXJsICs9IFwiJnRvPVwiICsgYmVzdFRpcmVDb25maWdJZDtcclxuXHJcblx0XHRcdFx0c2hvd0J1dHRvbih1cmwsIGRhdGEpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGdldFJTQXBpS2V5KCkudGhlbihmdW5jdGlvbihhcGlLZXkpeyBcclxuXHRcdFx0XHRcdHVybCArPSBhcGlLZXkgKyBcIiNcIjsgXHJcblx0XHRcdFx0XHRpZihiZXN0Q29uZmlndXJhdGlvbklkKSB1cmwgKz0gXCJ2Yz1cIiArIGJlc3RDb25maWd1cmF0aW9uSWQ7XHJcblx0XHRcdFx0XHRpZihiZXN0VGlyZUNvbmZpZ0lkKSB1cmwgKz0gXCImdG89XCIgKyBiZXN0VGlyZUNvbmZpZ0lkO1xyXG5cclxuXHRcdFx0XHRcdHNob3dCdXR0b24odXJsLCBkYXRhKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSB1c2VycyBSaWRlU3R5bGVyIGFwaSBrZXlcclxuXHRcdCAqIEByZXR1cm5zIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFJTQXBpS2V5KCl7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOlwiQXBpQWNjZXNzS2V5L0dldFNoYXJlZEtleVwifSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRpZihyZXNwb25zZSl7XHJcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2UuS2V5KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNob3cgdGhlIGJ1dHRvbiB0aGF0IHdpbGwgZGlyZWN0IHVzZXJzIHRvIHNob3djYXNlIGdpdmVuIGEgdXJsIHRvIHRoZSBzaG93Y2FzZS5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBzaG93QnV0dG9uKHVybCwgZGF0YSl7XHJcblx0XHRcdHJlbW92ZVN0YXRpY0xvYWRlcigpO1xyXG5cclxuXHRcdFx0bGV0IGNvbmZpcm1CdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcblxyXG5cdFx0XHRjb25maXJtQnV0dG9uLmhyZWYgPSB1cmw7XHJcblxyXG5cdFx0XHRpZiAoIW9wdGlvbnMub3BlbkluU2FtZVBhZ2UpXHJcblx0XHRcdFx0Y29uZmlybUJ1dHRvbi50YXJnZXQgPSAnX2JsYW5rJztcclxuXHRcdFx0XHJcblx0XHRcdGlmKG9wdGlvbnMuYnV0dG9uVGV4dCkgY29uZmlybUJ1dHRvbi5pbm5lckhUTUwgPSBvcHRpb25zLmJ1dHRvblRleHQ7XHJcblx0XHRcdGVsc2UgY29uZmlybUJ1dHRvbi5pbm5lckhUTUwgPSBcIkJyb3dzZSB3aGVlbHNcIjtcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuYnV0dG9uQ2xhc3Nlcykgb3B0aW9ucy5idXR0b25DbGFzc2VzLm1hcChidG5DbGFzcyA9PiBjb25maXJtQnV0dG9uLmNsYXNzTGlzdC5hZGQoYnRuQ2xhc3MpKTsgLy9pZiB1c2VyIGhhcyBzdXBlciBzZWNyZXQgc3BlY2lhbCBidXR0b24gY2xhc3Nlc1xyXG5cclxuXHRcdFx0Y29uZmlybUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XHJcblxyXG5cdFx0XHRcdG9wdGlvbnMuY2FsbGJhY2soZGF0YSk7XHJcblxyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQoY29uZmlybUJ1dHRvbik7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZW1vdmUgZWxlbWVudCBmcm9tIHRoZSBkb20gZ2l2ZW4gdGhlIG5hbWUgYXR0ciBvZiB0aGUgZWxlbWVudC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZGVzdHJveUZpZWxkKGtleSl7XHJcblx0XHRcdGxldCBmaWVsZEVsZW1lbnQgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJyk7XHJcblxyXG5cdFx0XHRpZihrZXkgIT09IFwibWFrZVwiICYmIGtleSAhPT0gXCJtb2RlbFwiKXsgLy9pZiB0aGUga2V5IGlzIG5vdCBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IGdldCByaWQgb2YgdGhlIHNlbGVjdGlvbiBjb21wbGV0ZWx5XHJcblx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpKXtcclxuXHRcdFx0XHRcdHRwbEVsLnJlbW92ZUNoaWxkKHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKS5wYXJlbnRFbGVtZW50KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7IC8vaWYgdGhlIGtleSBpcyBtYWtlIG9yIG1vZGVsLCB3ZSBqdXN0IHJlbW92ZSB0aGUgc2VsZWN0IG9wdGlvbnNcclxuXHRcdFx0XHRsZXQgZGlzYWJsZWRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpO1xyXG5cdFx0XHRcdGRpc2FibGVkRWwuaW5uZXJIVE1MID0ga2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnN1YnN0cigxLCBrZXkubGVuZ3RoKTtcclxuXHRcdFx0XHRmaWVsZEVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcclxuXHRcdFx0XHRmaWVsZEVsZW1lbnQuYXBwZW5kQ2hpbGQoZGlzYWJsZWRFbCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9XHJcblxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdGluaXRpYWxpemVXaWRnZXQoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0d2luZG93LlF1aWNrU2VsZWN0ID0gUXVpY2tTZWxlY3Q7XHJcbn0pKCk7XHJcbiJdfQ==
