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
      var url = options.url;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL0Ryb3Bib3ggKFJpZGVTdHlsZXIpL0J1cmtzb24vY29tLmJ1cmtzb24ucmlkZXN0eWxlci53aWRnZXRzL3dpZGdldHMvcXVpY2stc2VsZWN0L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvUXVpY2tTZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsQ0FBQyxZQUFZO0FBQ1o7Ozs7Ozs7Ozs7Ozs7O0FBY0EsV0FBUyxXQUFULENBQXFCLFdBQXJCLEVBQWtDLE9BQWxDLEVBQTJDO0FBQzFDLFFBQUksWUFBWSxHQUFHLEVBQW5CO0FBQUEsUUFDQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQVIsR0FBa0IsUUFBbEIsR0FBNkIsd0RBQXdELHdCQUF3QixFQUFoRixHQUFxRixHQUQ1SDtBQUFBLFFBRUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLG1CQUFsQixHQUF3QyxNQUFNLEdBQUcsYUFGM0Q7QUFBQSxRQUdDLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBUixHQUFrQix1QkFBbEIsR0FBNEMsTUFBTSxHQUFHLGdCQUgvRDtBQUFBLFFBSUMsS0FBSyxHQUFHLElBSlQ7QUFBQSxRQUtDLFNBQVMsR0FBRyxJQUxiO0FBQUEsUUFNQyxtQkFBbUIsR0FBRyxJQU52QjtBQUFBLFFBT0MsZ0JBQWdCLEdBQUcsSUFQcEI7QUFBQSxRQVFDLHFCQUFxQixHQUFHLElBUnpCO0FBQUEsUUFTQyx1QkFBdUIsR0FBRyxFQVQzQjtBQUFBLFFBVUMsS0FBSyxHQUFHLElBVlQ7QUFZQSxJQUFBLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBckI7QUFFQTs7OztBQUdBLGFBQVMsd0JBQVQsR0FBb0M7QUFDbkMsVUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBb0IsRUFBcEIsRUFBd0IsU0FBeEIsQ0FBWjtBQUVBLFVBQUksaUJBQWlC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OztBQUVELEVBQUEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsV0FBckI7QUFDQSxDQXRhRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbiAoKSB7XHJcblx0LyoqXHJcblx0ICogUXVpY2sgU2VsZWN0OiBSZW5kZXIgdGhlIFF1aWNrIFNlbGN0IHdpZGdldCB3aXRoaW4gYSBjb250YWluZXIgZWxlbWVudFxyXG5cdCAqIEBjb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBjb250YWluZXJJZCAtIFRoZSBpZCBvZiB0aGUgd2lkZ2V0J3MgcGFyZW50IGVsZW1lbnRcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gT3B0aW9uYWwgYXJndW1lbnRzXHJcblx0ICogQHBhcmFtIHtzdHJpbmdbXX0gW29wdGlvbnMuYnV0dG9uQ2xhc3Nlc11cclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmluY2x1ZGVTdHlsZXNdXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmNvbmZpZ1RpdGxlXVxyXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGV2TW9kZV1cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYXBpS2V5XVxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51cmxdXHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuY2FsbGJhY2tdXHJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub3BlbkluU2FtZVBhZ2VdXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gUXVpY2tTZWxlY3QoY29udGFpbmVySWQsIG9wdGlvbnMpIHtcclxuXHRcdGxldCB2ZWhpY2xlTW9kZWwgPSB7fSxcclxuXHRcdFx0Y2RuVXJsID0gb3B0aW9ucy5kZXZNb2RlID8gJy4vc3JjLycgOiAnaHR0cHM6Ly9zdGF0aWMucmlkZXN0eWxlci5jb20vd2lkZ2V0cy9xdWljay1zZWxlY3QvJyArIGdldFJpZGVTdHlsZXJFbnZpcm9ubWVudCgpICsgJy8nLFxyXG5cdFx0XHR0cGxVcmwgPSBvcHRpb25zLmRldk1vZGUgPyAnLi9zcmMvaHRtbC9xcy50cGwnIDogY2RuVXJsICsgJ2h0bWwvcXMudHBsJyxcclxuXHRcdFx0Y3NzVXJsID0gb3B0aW9ucy5kZXZNb2RlID8gJy4vZGlzdC9jc3MvcXMubWluLmNzcycgOiBjZG5VcmwgKyAnY3NzL3FzLm1pbi5jc3MnLFxyXG5cdFx0XHR0cGxFbCA9IG51bGwsXHJcblx0XHRcdGNvbnRhaW5lciA9IG51bGwsXHJcblx0XHRcdGJlc3RDb25maWd1cmF0aW9uSWQgPSBudWxsLFxyXG5cdFx0XHRiZXN0VGlyZUNvbmZpZ0lkID0gbnVsbCxcclxuXHRcdFx0YmVzdFRpcmVPcHRpb25EZXRhaWxzID0gbnVsbCxcclxuXHRcdFx0dGlyZU9wdGlvbkRldGFpbHNMb29rdXAgPSB7fSxcclxuXHRcdFx0dGhlbWUgPSBudWxsO1xyXG5cclxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IFJpZGVTdHlsZXIgZW52aXJvbm1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0UmlkZVN0eWxlckVudmlyb25tZW50KCkge1xyXG5cdFx0XHRjb25zdCB1cmwgPSByaWRlc3R5bGVyLmFqYXgudXJsKCcnLCB1bmRlZmluZWQpO1xyXG5cdFx0XHJcblx0XHRcdGlmICgvXFwvYXBpLWFscGhhXFwuL2kudGVzdCh1cmwpKSByZXR1cm4gJ2FscGhhJztcclxuXHRcdFx0ZWxzZSBpZiAoL1xcL2FwaS1iZXRhXFwuL2kudGVzdCh1cmwpKSByZXR1cm4gJ2JldGEnO1xyXG5cdFx0XHRlbHNlIGlmICgvXFwvYXBpXFwuL2kudGVzdCh1cmwpKSByZXR1cm4gJ2VkZ2UnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSBjbGllbnRzIHRoZW1lXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldENsaWVudFRoZW1lKCl7XHJcblx0XHRcdHJldHVybiByaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOidjbGllbnQvR2V0VGhlbWUnfSkudGhlbih0aGluZyA9PiB7XHJcblx0XHRcdFx0aWYodGhpbmcgJiYgdGhpbmcuVGhlbWUpe1xyXG5cdFx0XHRcdFx0Y29udGFpbmVyLnN0eWxlLnNldFByb3BlcnR5KCctLXByaW1hcnlDb2xvcicsIHRoaW5nLlRoZW1lLlByaW1hcnlDb2xvcik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgb3VyIHRlbXBsYXRlIGFuZCBzdHlsZXMgaWYgc3BlY2lmaWVkLiBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIG91ciBzZWxlY3RzLlxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBpbml0aWFsaXplV2lkZ2V0KCl7XHJcblx0XHRcdGluaXRpYWxpemVDb250YWluZXIoKTtcclxuXHRcdFx0bG9hZFRwbCgpLnRoZW4oZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRpZihvcHRpb25zLmluY2x1ZGVTdHlsZXMpIHtcclxuXHRcdFx0XHRcdGdldENsaWVudFRoZW1lKCk7XHJcblx0XHRcdFx0XHRsb2FkU3R5bGVzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGluaXRpYWxpemVVaSgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSW5pdGlhbGl6ZSBvdXIgY29udGFpbmVyIGVsZW1lbnRcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRhaW5lcigpe1xyXG5cdFx0XHRpZihjb250YWluZXJJZCkgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycgKyBjb250YWluZXJJZCk7XHJcblx0XHRcdGVsc2UgY29uc29sZS5lcnJvcigndGhlIHByb3ZpZGVkIGNvbnRhaW5lciBpcyBub3QgdmFsaWQuJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2FkIHRoZSBRdWljayBTZWxlY3QgdHBsXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGxvYWRUcGwoKSB7XHJcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0XHRsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0XHJcblx0XHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0bGV0IGNvbXBsZXRlZCA9IDQ7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IGNvbXBsZXRlZCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XHJcblx0XHRcdFx0XHRcdFx0dHBsRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmlkZXN0eWxlci1xdWljay1zZWxlY3QnKTtcclxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignUXVpY2sgU2VsZWN0IHRlbXBsYXRlIGZhaWxlZCB0byBsb2FkLicpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0XHRcdHhoci5vcGVuKCdHRVQnLCB0cGxVcmwsIHRydWUpO1xyXG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgb3VyIHN1cGVyIHNwZWNpYWwgc2VjcmV0IHN0eWxlc1xyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkU3R5bGVzKCkge1xyXG5cdFx0XHRsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuXHRcdFx0bGluay5ocmVmID0gY3NzVXJsO1xyXG5cdFx0XHRsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xyXG5cdFx0XHRsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemUgb3VyIGN1cnJlbnQgdmVoaWNsZSBzZWxlY3Rpb24gc2VsZWN0cyB3aXRoIGNoYW5nZSBldmVudCBsaXN0ZW5lcnNcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gaW5pdGlhbGl6ZVVpKCl7XHJcblx0XHRcdGxldCB5ZWFyRWwgPSB0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT15ZWFyXScpLFxyXG5cdFx0XHRcdG1ha2VFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1ha2VdJyksXHJcblx0XHRcdFx0bW9kZWxFbCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPW1vZGVsXScpLFxyXG5cdFx0XHRcdGNvbmZpZ1RpdGxlID0gdHBsRWwucXVlcnlTZWxlY3RvcignI2NvbmZpZy1tZXNzYWdlJyksXHJcblx0XHRcdFx0c2VsZWN0SWNvbiA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJy5jb25maWctc2VsZWN0LWljb24nKTtcclxuXHJcblx0XHRcdGlmKG9wdGlvbnMuY29uZmlnVGl0bGUpIGNvbmZpZ1RpdGxlLmlubmVySFRNTCA9IG9wdGlvbnMuY29uZmlnVGl0bGU7XHJcblxyXG5cdFx0XHRsb2FkTmV4dFN0ZXAoKTtcclxuXHJcblx0XHRcdHllYXJFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0XHRtYWtlRWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oZXZlbnQpe2xvYWROZXh0U3RlcChldmVudCl9KTtcclxuXHRcdFx0bW9kZWxFbC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCl7bG9hZE5leHRTdGVwKGV2ZW50KX0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIExvYWQgbmV4dCB2ZWhpY2xlIHNlbGVjdGlvbiBzdGVwXHJcblx0XHQgKiBAcGFyYW0ge0V2ZW50fSBlIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBsb2FkTmV4dFN0ZXAoZSl7XHJcblx0XHRcdGxldCBjdXJyZW50RWwgPSBlLFxyXG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsLFxyXG5cdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0ID0ge1NlbGVjdGlvbjpbXX0sXHJcblx0XHRcdFx0bG9hZGVyID0gbnVsbDtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGN1cnJlbnRFbCl7XHJcblx0XHRcdFx0aWYoY3VycmVudEVsLnRhcmdldCkgY3VycmVudEVsID0gY3VycmVudEVsLnRhcmdldDtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlLWxvYWRlcicpKSBjdXJyZW50RWwucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1sb2FkZXInKTtcclxuXHRcdFx0XHRpZihjdXJyZW50RWwucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJykpe1xyXG5cdFx0XHRcdFx0bG9hZGVyID0gY3VycmVudEVsLnBhcmVudEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbG9hZGVyJyk7XHJcblx0XHRcdFx0XHRsb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y3VycmVudFNlbGVjdGlvbiA9IGN1cnJlbnRFbC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcclxuXHJcblx0XHRcdFx0aWYodmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dKSB7IC8vIGlmIHRoZSBzZWxlY3Rpb24gYWxyZWFkeSBleGlzdHNcclxuXHRcdFx0XHRcdHZlaGljbGVNb2RlbFtjdXJyZW50U2VsZWN0aW9uXSA9IGN1cnJlbnRFbC52YWx1ZTtcclxuXHRcdFx0XHRcdHJlc2V0U3RlcHNBZnRlcihjdXJyZW50U2VsZWN0aW9uKTtcclxuXHRcdFx0XHR9IGVsc2UgeyAvLyBlbHNlIGFkZCBpdFxyXG5cdFx0XHRcdFx0dmVoaWNsZU1vZGVsW2N1cnJlbnRTZWxlY3Rpb25dID0gY3VycmVudEVsLnZhbHVlOyBcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChjdXJyZW50U2VsZWN0aW9uICE9PSAneWVhcicgJiYgY3VycmVudFNlbGVjdGlvbiAhPT0gJ21ha2UnKVxyXG5cdFx0XHRcdFx0YWRkU3RhdGljTG9hZGVyKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvcihsZXQgcHJvcGVydHkgaW4gdmVoaWNsZU1vZGVsKXtcclxuXHRcdFx0XHRpZih2ZWhpY2xlTW9kZWxbcHJvcGVydHldICE9IFwiXCIpe1xyXG5cdFx0XHRcdFx0aWYocHJvcGVydHkgPT0gJ3RpcmUnKSB7XHJcblx0XHRcdFx0XHRcdGJlc3RUaXJlQ29uZmlnSWQgPSB2ZWhpY2xlTW9kZWxbcHJvcGVydHldO1xyXG5cdFx0XHRcdFx0XHRiZXN0VGlyZU9wdGlvbkRldGFpbHMgPSB0aXJlT3B0aW9uRGV0YWlsc0xvb2t1cFtiZXN0VGlyZUNvbmZpZ0lkXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZlaGljbGVTZWxlY3RSZXF1ZXN0LlNlbGVjdGlvbi5wdXNoKFxyXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eSArIFwiOlwiICsgdmVoaWNsZU1vZGVsW3Byb3BlcnR5XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKGN1cnJlbnRTZWxlY3Rpb24gIT0gJ3RpcmUnKXtcclxuXHRcdFx0XHRyaWRlc3R5bGVyLmFqYXguc2VuZCh7YWN0aW9uOidWZWhpY2xlL1NlbGVjdCcsIGRhdGE6dmVoaWNsZVNlbGVjdFJlcXVlc3R9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdFx0aWYoIXZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0peyAvL2lmIGtleSBkb2Vzbid0IGFscmVhZHkgZXhpc3QgaW4gb3VyIHZlaGljbGUgbW9kZWwsIGFkZCBpdCBhbmQgcG9wdWxhdGUgdGhlIHNlbGVjdCBmaWVsZFxyXG5cdFx0XHRcdFx0XHRcdHZlaGljbGVNb2RlbFtyZXNwb25zZS5NZW51LktleV0gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHRcdHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMocmVzcG9uc2UuTWVudSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSBpZihyZXNwb25zZS5CZXN0Q29uZmlndXJhdGlvbil7IC8vaWYgd2UgaGF2ZSBvdXIgQmVzdENvbmZpZ3VyYXRpb24gc2V0IHRoZW4gd2UgbmVlZCB0byBnZXQgb3VyIHRpcmUgY29uZmlnXHJcblx0XHRcdFx0XHRcdFx0YmVzdENvbmZpZ3VyYXRpb25JZCA9IHJlc3BvbnNlLkJlc3RDb25maWd1cmF0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRcdGdldFRpcmVDb25maWcoKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dXBkYXRlQnV0dG9uKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlc2V0IHN0ZXBzIGFmdGVyIGN1cnJlbnQgc3RlcFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGN1cnJlbnRTdGVwIFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiByZXNldFN0ZXBzQWZ0ZXIoY3VycmVudFN0ZXApe1xyXG5cdFx0XHRsZXQgY3VycmVudEluZGV4ID0gT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGN1cnJlbnRTdGVwKTtcclxuXHJcblx0XHRcdGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh2ZWhpY2xlTW9kZWwpKSB7XHJcblx0XHRcdFx0aWYoT2JqZWN0LmtleXModmVoaWNsZU1vZGVsKS5pbmRleE9mKGtleSkgPiBjdXJyZW50SW5kZXgpe1xyXG5cdFx0XHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9JyArIGtleSArICddJykpe1xyXG5cdFx0XHRcdFx0XHRkZXN0cm95RmllbGQoa2V5KTtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHZlaGljbGVNb2RlbFtrZXldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHBsRWwucXVlcnlTZWxlY3RvcignYScpKSB0cGxFbC5yZW1vdmVDaGlsZCh0cGxFbC5xdWVyeVNlbGVjdG9yKCdhJykpXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gYWRkU3RhdGljTG9hZGVyKCkge1xyXG5cdFx0XHRyZW1vdmVTdGF0aWNMb2FkZXIoKTtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBzdGF0aWNMb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcblx0XHRcdHN0YXRpY0xvYWRlci5jbGFzc05hbWUgPSBcInNlbGVjdC1sb2FkZXIgc3RhdGljLWxvYWRlclwiO1xyXG5cdFx0XHRcclxuXHRcdFx0dHBsRWwuYXBwZW5kQ2hpbGQoc3RhdGljTG9hZGVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiByZW1vdmVTdGF0aWNMb2FkZXIoKSB7XHJcblx0XHRcdHRwbEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zdGF0aWMtbG9hZGVyJykuZm9yRWFjaChlbCA9PiBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQb3B1bGF0ZSBhIGdpdmVuIHNlbGVjdCBmaWVsZCB3aXRoIG91ciBnaXZlbiB2YWx1ZXNcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBuZXdGaWVsZEluZm8gXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHBvcHVsYXRlVmVoaWNsZU9wdGlvbnMobmV3RmllbGRJbmZvLCBpc1RpcmVPcHRpb25zKXtcclxuXHRcdFx0bGV0IHNlbGVjdEVsZW1lbnQgPSBudWxsLFxyXG5cdFx0XHRcdGZpZWxkSW5mbyA9IHt9O1xyXG5cclxuXHJcblx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRoZXNlIGFyZSB0aXJlIG9wdGlvbnMgd2Uga25vdyB3ZSBuZWVkIHRvIGdlbmVyYXRlIGEgbmV3IGZpZWxkIHdpdGggaW5mbyBub3QgZnJvbSB0aGUgcGFzc2VkIGRhdGFcclxuXHRcdFx0XHRmaWVsZEluZm8gPSB7S2V5OiAndGlyZScsIENhbGxiYWNrOiBsb2FkTmV4dFN0ZXB9O1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH0gZWxzZSBpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nICsgbmV3RmllbGRJbmZvLktleSArICddJykpeyAvL2Vsc2UgaWYgdGhlIGZpZWxkIGFscmVhZHkgZXhpc3RzIHdlIHdhbnQgdG8gdXNlIGl0XHJcblx0XHRcdFx0c2VsZWN0RWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScgKyBuZXdGaWVsZEluZm8uS2V5ICsgJ10nKTtcclxuXHRcdFx0fSBlbHNlIHsgLy9lbHNlIHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBuZXcgZmllbGRcclxuXHRcdFx0XHRmaWVsZEluZm8uTGFiZWwgPSBuZXdGaWVsZEluZm8uVGl0bGU7XHJcblx0XHRcdFx0ZmllbGRJbmZvLktleSA9IG5ld0ZpZWxkSW5mby5LZXk7XHJcblx0XHRcdFx0ZmllbGRJbmZvLkNhbGxiYWNrID0gbG9hZE5leHRTdGVwO1xyXG5cdFx0XHRcdHNlbGVjdEVsZW1lbnQgPSBnZW5lcmF0ZU5ld0ZpZWxkKGZpZWxkSW5mbyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID4gMCl7IC8vV2Ugd2FudCB0byBtYWtlIHN1cmUgdGhlcmUgYXJlIG9wdGlvbnMgZmlyc3RcclxuXHRcdFx0XHRuZXdGaWVsZEluZm8uT3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG9wdGlvbil7XHJcblx0XHRcdFx0XHRsZXQgb3B0aW9uRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcclxuXHRcdFx0XHRcdGlmKGlzVGlyZU9wdGlvbnMpeyAvL2lmIHRpcmUgb3B0aW9uIHdlIGtub3cgdGhlIGRhdGEgaXMgZGlmZmVyZW50XHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlRpcmVPcHRpb25JRDtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuaW5uZXJIVE1MID0gb3B0aW9uLkZyb250LkRlc2NyaXB0aW9uO1xyXG5cdFx0XHRcdFx0XHRzZWxlY3RFbGVtZW50LmFwcGVuZENoaWxkKG9wdGlvbkVsKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIGVsc2Ugb3B0aW9uIGRhdGEgaXMgYWx3YXlzIHRoZSBzYW1lXHJcblx0XHRcdFx0XHRcdG9wdGlvbkVsLnZhbHVlID0gb3B0aW9uLlZhbHVlO1xyXG5cdFx0XHRcdFx0XHRvcHRpb25FbC5pbm5lckhUTUwgPSBvcHRpb24uTGFiZWw7XHJcblx0XHRcdFx0XHRcdHNlbGVjdEVsZW1lbnQuYXBwZW5kQ2hpbGQob3B0aW9uRWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobmV3RmllbGRJbmZvLk9wdGlvbnMubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0b3B0aW9uRWwuc2V0QXR0cmlidXRlKCdzZWxlY3RlZCcsIHRydWUpOyAvL2NoZWNrIGlmIHRoZXJlIGlzIG9ubHkgb25lIG9wdGlvbiwgaWYgc28gc2VsZWN0IGl0XHJcblx0XHRcdFx0XHRcdGlmKG5ld0ZpZWxkSW5mby5LZXkgIT0gJ21ha2UnICYmIG5ld0ZpZWxkSW5mby5LZXkgIT0gJ21vZGVsJykgc2VsZWN0RWxlbWVudC5wYXJlbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHRcclxuXHRcdFx0fSBcclxuXHJcblx0XHRcdHNlbGVjdEVsZW1lbnQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZS1sb2FkZXInKTtcdC8vcmVtb3ZlIGxvYWRlciBvbiBzZWxlY3QgZWxlbWVudFxyXG5cdFx0XHRpZihzZWxlY3RFbGVtZW50Lmxlbmd0aCA9PSAyKSBsb2FkTmV4dFN0ZXAoc2VsZWN0RWxlbWVudCk7IC8vaWYgdGhlcmUgd2FzIG9ubHkgb25lIG9wdGlvbiBtb3ZlIHRvIG5leHQgc3RlcC5cclxuXHRcdFx0ZWxzZSByZW1vdmVTdGF0aWNMb2FkZXIoKTtcdFx0XHRcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdlbmVyYXRlIGEgbmV3IGZpZWxkIGdpdmVuIHRoZSBuYW1lIGFuZCBuZXcgdmFsdWVzXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmV3RmllbGRJbmZvIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gb3B0aW9ucyBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2VuZXJhdGVOZXdGaWVsZChuZXdGaWVsZEluZm8pe1xyXG5cdFx0XHRsZXQgbmV3RmllbGREaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcclxuXHRcdFx0XHRuZXdGaWVsZFNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdCcpLFxyXG5cdFx0XHRcdGRlZmF1bHRPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKSxcclxuXHRcdFx0XHRzZWxlY3RJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXHJcblx0XHRcdFx0c2VsZWN0TG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWxvYWRlcicpO1xyXG5cdFx0XHRzZWxlY3RMb2FkZXIuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWxvYWRlcicpO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5jbGFzc0xpc3QuYWRkKCdjb25maWctc2VsZWN0Jyk7XHJcblx0XHRcdHNlbGVjdEljb24uY2xhc3NMaXN0LmFkZCgnY29uZmlnLXNlbGVjdC1pY29uJyk7XHJcblx0XHRcdGRlZmF1bHRPcHRpb24uaW5uZXJIVE1MID0gKG5ld0ZpZWxkSW5mby5LZXkgPT0gJ2ZlYXR1cmVzX3BpY2t1cCcgPyAnRmVhdHVyZScgOiBuZXdGaWVsZEluZm8uS2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmV3RmllbGRJbmZvLktleS5zdWJzdHIoMSwgbmV3RmllbGRJbmZvLktleS5sZW5ndGgpKTtcclxuXHRcdFx0bmV3RmllbGRTZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgbmV3RmllbGRJbmZvLktleSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKGV2ZW50KXtuZXdGaWVsZEluZm8uQ2FsbGJhY2soZXZlbnQpfSk7XHJcblx0XHRcdG5ld0ZpZWxkU2VsZWN0LmFwcGVuZENoaWxkKGRlZmF1bHRPcHRpb24pO1xyXG5cdFx0XHRuZXdGaWVsZERpdi5hcHBlbmRDaGlsZChuZXdGaWVsZFNlbGVjdCk7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKHNlbGVjdExvYWRlcik7XHJcblx0XHRcdG5ld0ZpZWxkRGl2LmFwcGVuZENoaWxkKHNlbGVjdEljb24pO1xyXG5cdFx0XHR0cGxFbC5hcHBlbmRDaGlsZChuZXdGaWVsZERpdik7XHJcblxyXG5cdFx0XHRyZXR1cm4gbmV3RmllbGRTZWxlY3Q7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTaG93cyBhdmFpbGJsZSB0aXJlIGNvbmZpZ3VyYXRpb25zIHRvIHRoZSB1c2VyXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGdldFRpcmVDb25maWcoKXtcclxuXHRcdFx0cmV0dXJuIHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246J3ZlaGljbGUvZ2V0dGlyZW9wdGlvbmRldGFpbHMnLCBkYXRhOntWZWhpY2xlQ29uZmlndXJhdGlvbnM6IFtiZXN0Q29uZmlndXJhdGlvbklkXX19KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRpZihyZXNwb25zZSAmJiByZXNwb25zZS5EZXRhaWxzLmxlbmd0aCl7XHJcblx0XHRcdFx0XHR2ZWhpY2xlTW9kZWwudGlyZSA9ICcnO1xyXG5cclxuXHRcdFx0XHRcdGxldCB0aXJlT3B0aW9ucyA9IHtPcHRpb25zOiByZXNwb25zZS5EZXRhaWxzfVxyXG5cclxuXHRcdFx0XHRcdHRpcmVPcHRpb25EZXRhaWxzTG9va3VwID0ge307XHJcblx0XHRcdFx0XHRyZXNwb25zZS5EZXRhaWxzLmZvckVhY2goZGV0YWlsID0+IHtcclxuXHRcdFx0XHRcdFx0dGlyZU9wdGlvbkRldGFpbHNMb29rdXBbZGV0YWlsLlRpcmVPcHRpb25JRF0gPSBkZXRhaWw7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRwb3B1bGF0ZVZlaGljbGVPcHRpb25zKHRpcmVPcHRpb25zLCB0cnVlKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dXBkYXRlQnV0dG9uKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEJ1aWxkIHRoZSBkYXRhIHRoYXQgd2lsbCB0YWtlIHVzZXJzIHRvIHRoZSBzaG93Y2FzZSB3aXRoIHRoZWlyIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MuXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHVwZGF0ZUJ1dHRvbigpe1xyXG5cdFx0XHRsZXQgdXJsID0gb3B0aW9ucy51cmw7XHJcblxyXG5cdFx0XHRpZih1cmwuaW5kZXhPZignPycpID09IC0xKSB1cmwgKz0gJz8nO1xyXG5cdFx0XHRlbHNlIHVybCArPSAnJic7XHJcblxyXG5cdFx0XHRjb25zdCBkYXRhID0gYmVzdFRpcmVPcHRpb25EZXRhaWxzID8gYmVzdFRpcmVPcHRpb25EZXRhaWxzIDoge1xyXG5cdFx0XHRcdENvbmZpZ3VyYXRpb25JRDogYmVzdENvbmZpZ3VyYXRpb25JZFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5hcGlLZXkpe1xyXG5cdFx0XHRcdHVybCArPSBvcHRpb25zLmFwaUtleSArIFwiI1wiO1xyXG5cdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRpZihiZXN0VGlyZUNvbmZpZ0lkKSB1cmwgKz0gXCImdG89XCIgKyBiZXN0VGlyZUNvbmZpZ0lkO1xyXG5cclxuXHRcdFx0XHRzaG93QnV0dG9uKHVybCwgZGF0YSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Z2V0UlNBcGlLZXkoKS50aGVuKGZ1bmN0aW9uKGFwaUtleSl7IFxyXG5cdFx0XHRcdFx0dXJsICs9IGFwaUtleSArIFwiI1wiOyBcclxuXHRcdFx0XHRcdGlmKGJlc3RDb25maWd1cmF0aW9uSWQpIHVybCArPSBcInZjPVwiICsgYmVzdENvbmZpZ3VyYXRpb25JZDtcclxuXHRcdFx0XHRcdGlmKGJlc3RUaXJlQ29uZmlnSWQpIHVybCArPSBcIiZ0bz1cIiArIGJlc3RUaXJlQ29uZmlnSWQ7XHJcblxyXG5cdFx0XHRcdFx0c2hvd0J1dHRvbih1cmwsIGRhdGEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgdGhlIHVzZXJzIFJpZGVTdHlsZXIgYXBpIGtleVxyXG5cdFx0ICogQHJldHVybnMge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gZ2V0UlNBcGlLZXkoKXtcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpe1xyXG5cdFx0XHRcdHJpZGVzdHlsZXIuYWpheC5zZW5kKHthY3Rpb246XCJBcGlBY2Nlc3NLZXkvR2V0U2hhcmVkS2V5XCJ9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdGlmKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZS5LZXkpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2hvdyB0aGUgYnV0dG9uIHRoYXQgd2lsbCBkaXJlY3QgdXNlcnMgdG8gc2hvd2Nhc2UgZ2l2ZW4gYSB1cmwgdG8gdGhlIHNob3djYXNlLlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIHNob3dCdXR0b24odXJsLCBkYXRhKXtcclxuXHRcdFx0cmVtb3ZlU3RhdGljTG9hZGVyKCk7XHJcblxyXG5cdFx0XHRsZXQgY29uZmlybUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuXHJcblx0XHRcdGNvbmZpcm1CdXR0b24uaHJlZiA9IHVybDtcclxuXHJcblx0XHRcdGlmICghb3B0aW9ucy5vcGVuSW5TYW1lUGFnZSlcclxuXHRcdFx0XHRjb25maXJtQnV0dG9uLnRhcmdldCA9ICdfYmxhbmsnO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25UZXh0KSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IG9wdGlvbnMuYnV0dG9uVGV4dDtcclxuXHRcdFx0ZWxzZSBjb25maXJtQnV0dG9uLmlubmVySFRNTCA9IFwiQnJvd3NlIHdoZWVsc1wiO1xyXG5cclxuXHRcdFx0aWYob3B0aW9ucy5idXR0b25DbGFzc2VzKSBvcHRpb25zLmJ1dHRvbkNsYXNzZXMubWFwKGJ0bkNsYXNzID0+IGNvbmZpcm1CdXR0b24uY2xhc3NMaXN0LmFkZChidG5DbGFzcykpOyAvL2lmIHVzZXIgaGFzIHN1cGVyIHNlY3JldCBzcGVjaWFsIGJ1dHRvbiBjbGFzc2VzXHJcblxyXG5cdFx0XHRjb25maXJtQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVybjtcclxuXHJcblx0XHRcdFx0b3B0aW9ucy5jYWxsYmFjayhkYXRhKTtcclxuXHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHR0cGxFbC5hcHBlbmRDaGlsZChjb25maXJtQnV0dG9uKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbW92ZSBlbGVtZW50IGZyb20gdGhlIGRvbSBnaXZlbiB0aGUgbmFtZSBhdHRyIG9mIHRoZSBlbGVtZW50LlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGtleVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBkZXN0cm95RmllbGQoa2V5KXtcclxuXHRcdFx0bGV0IGZpZWxkRWxlbWVudCA9IHRwbEVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPScrIGtleSArJ10nKTtcclxuXHJcblx0XHRcdGlmKGtleSAhPT0gXCJtYWtlXCIgJiYga2V5ICE9PSBcIm1vZGVsXCIpeyAvL2lmIHRoZSBrZXkgaXMgbm90IG1ha2Ugb3IgbW9kZWwsIHdlIGp1c3QgZ2V0IHJpZCBvZiB0aGUgc2VsZWN0aW9uIGNvbXBsZXRlbHlcclxuXHRcdFx0XHRpZih0cGxFbC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT0nKyBrZXkgKyddJykpe1xyXG5cdFx0XHRcdFx0dHBsRWwucmVtb3ZlQ2hpbGQodHBsRWwucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9Jysga2V5ICsnXScpLnBhcmVudEVsZW1lbnQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHsgLy9pZiB0aGUga2V5IGlzIG1ha2Ugb3IgbW9kZWwsIHdlIGp1c3QgcmVtb3ZlIHRoZSBzZWxlY3Qgb3B0aW9uc1xyXG5cdFx0XHRcdGxldCBkaXNhYmxlZEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XHJcblx0XHRcdFx0ZGlzYWJsZWRFbC5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcblx0XHRcdFx0ZGlzYWJsZWRFbC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgdHJ1ZSk7XHJcblx0XHRcdFx0ZGlzYWJsZWRFbC5pbm5lckhUTUwgPSBrZXkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBrZXkuc3Vic3RyKDEsIGtleS5sZW5ndGgpO1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cdFx0XHRcdGZpZWxkRWxlbWVudC5hcHBlbmRDaGlsZChkaXNhYmxlZEVsKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcclxuXHRcdFx0aW5pdGlhbGl6ZVdpZGdldCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHR3aW5kb3cuUXVpY2tTZWxlY3QgPSBRdWlja1NlbGVjdDtcclxufSkoKTtcclxuIl19
