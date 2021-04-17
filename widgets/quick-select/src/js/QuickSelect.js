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
		let vehicleModel = {},
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
			const url = ridestyler.ajax.url('', undefined);
		
			if (/\/api-alpha\./i.test(url)) return 'alpha';
			else if (/\/api-beta\./i.test(url)) return 'beta';
			else if (/\/api\./i.test(url)) return 'edge';
		}

		/**
		 * Get the clients theme
		 */
		function getClientTheme(){
			return ridestyler.ajax.send({action:'client/GetTheme'}).then(thing => {
				if(thing && thing.Theme){
					container.style.setProperty('--primaryColor', thing.Theme.PrimaryColor);
				}
			});
		}

		/**
		 * Load our template and styles if specified. Add event listeners to our selects.
		 */
		function initializeWidget(){
			initializeContainer();
			loadTpl().then(function(){
				if(options.includeStyles) {
					getClientTheme();
					loadStyles();
				}
				initializeUi();
			})
		}

		/**
		 * Initialize our container element
		 */
		function initializeContainer(){
			if(containerId) container = document.querySelector('#' + containerId);
			else console.error('the provided container is not valid.');
		}

		/**
		 * Load the Quick Select tpl
		 */
		function loadTpl() {
			return new Promise(function(resolve){
				let xhr = new XMLHttpRequest();
	
				xhr.onreadystatechange = function() {
					let completed = 4;
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
			let link = document.createElement('link');
			link.href = cssUrl;
			link.type = 'text/css';
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}

		/**
		 * Initialize our current vehicle selection selects with change event listeners
		 */
		function initializeUi(){
			let yearEl = tplEl.querySelector('select[name=year]'),
				makeEl = tplEl.querySelector('select[name=make]'),
				modelEl = tplEl.querySelector('select[name=model]'),
				configTitle = tplEl.querySelector('#config-message'),
				selectIcon = tplEl.querySelector('.config-select-icon');

			if(options.configTitle) configTitle.innerHTML = options.configTitle;

			loadNextStep();

			yearEl.addEventListener('change', function(event){loadNextStep(event)});
			makeEl.addEventListener('change', function(event){loadNextStep(event)});
			modelEl.addEventListener('change', function(event){loadNextStep(event)});
		}
		
		/**
		 * Load next vehicle selection step
		 * @param {Event} e 
		 */
		function loadNextStep(e){
			let currentEl = e,
				currentSelection = null,
				vehicleSelectRequest = {Selection:[]},
				loader = null;
			
			if(currentEl){
				if(currentEl.target) currentEl = currentEl.target;
				if(currentEl.parentElement.lastElementChild.classList.contains('active-loader')) currentEl.parentElement.lastElementChild.classList.remove('active-loader');
				if(currentEl.parentElement.nextElementSibling && currentEl.parentElement.nextElementSibling.querySelector('.select-loader')){
					loader = currentEl.parentElement.nextElementSibling.querySelector('.select-loader');
					loader.classList.add('active-loader');
				}

				currentSelection = currentEl.getAttribute('name');

				if(vehicleModel[currentSelection]) { // if the selection already exists
					vehicleModel[currentSelection] = currentEl.value;
					resetStepsAfter(currentSelection);
				} else { // else add it
					vehicleModel[currentSelection] = currentEl.value; 
				}

				if (currentSelection !== 'year' && currentSelection !== 'make')
					addStaticLoader();
			}

			for(let property in vehicleModel){
				if(vehicleModel[property] != ""){
					if(property == 'tire') {
						bestTireConfigId = vehicleModel[property];
						bestTireOptionDetails = tireOptionDetailsLookup[bestTireConfigId];
					}
					vehicleSelectRequest.Selection.push(
						property + ":" + vehicleModel[property]
					);
				}
			}

			if(currentSelection != 'tire'){
				ridestyler.ajax.send({action:'Vehicle/Select', data:vehicleSelectRequest}).then(function(response){
					if(response){
						if(!vehicleModel[response.Menu.Key]){ //if key doesn't already exist in our vehicle model, add it and populate the select field
							vehicleModel[response.Menu.Key] = "";
							populateVehicleOptions(response.Menu);
						} else if(response.BestConfiguration){ //if we have our BestConfiguration set then we need to get our tire config
							bestConfigurationId = response.BestConfiguration.Value;
							getTireConfig()
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
		function resetStepsAfter(currentStep){
			let currentIndex = Object.keys(vehicleModel).indexOf(currentStep);

			for (let [key, value] of Object.entries(vehicleModel)) {
				if(Object.keys(vehicleModel).indexOf(key) > currentIndex){
					if(tplEl.querySelector('select[name=' + key + ']')){
						destroyField(key);
						delete vehicleModel[key];
					}
				}
			}
			
			if(tplEl.querySelector('a')) tplEl.removeChild(tplEl.querySelector('a'))
		}

		function addStaticLoader() {
			removeStaticLoader();
			
			var staticLoader = document.createElement('div');

			staticLoader.className = "select-loader static-loader";
			
			tplEl.appendChild(staticLoader);
		}

		function removeStaticLoader() {
			tplEl.querySelectorAll('.static-loader').forEach(el => el.parentElement.removeChild(el));
		}

		/**
		 * Populate a given select field with our given values
		 * @param {Object} newFieldInfo 
		 */
		function populateVehicleOptions(newFieldInfo, isTireOptions){
			let selectElement = null,
				fieldInfo = {};


			if(isTireOptions){ //if these are tire options we know we need to generate a new field with info not from the passed data
				fieldInfo = {Key: 'tire', Callback: loadNextStep};
				selectElement = generateNewField(fieldInfo);
			} else if(tplEl.querySelector('select[name=' + newFieldInfo.Key + ']')){ //else if the field already exists we want to use it
				selectElement = tplEl.querySelector('select[name=' + newFieldInfo.Key + ']');
			} else { //else we want to generate a new field
				fieldInfo.Label = newFieldInfo.Title;
				fieldInfo.Key = newFieldInfo.Key;
				fieldInfo.Callback = loadNextStep;
				selectElement = generateNewField(fieldInfo);
			}

			selectElement.removeAttribute('disabled');

			if(newFieldInfo.Options.length > 0){ //We want to make sure there are options first
				newFieldInfo.Options.forEach(function(option){
					let optionEl = document.createElement('option');
					if(isTireOptions){ //if tire option we know the data is different
						optionEl.value = option.TireOptionID;
						optionEl.innerHTML = option.Front.Description;
						selectElement.appendChild(optionEl);
					} else { // else option data is always the same
						optionEl.value = option.Value;
						optionEl.innerHTML = option.Label;
						selectElement.appendChild(optionEl);
					}
					if(newFieldInfo.Options.length == 1) {
						optionEl.setAttribute('selected', true); //check if there is only one option, if so select it
						if(newFieldInfo.Key != 'make' && newFieldInfo.Key != 'model') selectElement.parentElement.style.display = 'none';
					}
				});	
			} 

			selectElement.nextElementSibling.classList.remove('active-loader');	//remove loader on select element
			if(selectElement.length == 2) loadNextStep(selectElement); //if there was only one option move to next step.
			else removeStaticLoader();			
		}

		/**
		 * Generate a new field given the name and new values
		 * @param {String} newFieldInfo 
		 * @param {Array} options 
		 */
		function generateNewField(newFieldInfo){
			let newFieldDiv = document.createElement('div'),
				newFieldSelect = document.createElement('select'),
				defaultOption = document.createElement('option'),
				selectIcon = document.createElement('div'),
				selectLoader = document.createElement('div');

			selectLoader.classList.add('active-loader');
			selectLoader.classList.add('select-loader');
			newFieldDiv.classList.add('config-select');
			selectIcon.classList.add('config-select-icon');
			defaultOption.innerHTML = (newFieldInfo.Key == 'features_pickup' ? 'Feature' : newFieldInfo.Key.charAt(0).toUpperCase() + newFieldInfo.Key.substr(1, newFieldInfo.Key.length));
			newFieldSelect.setAttribute('name', newFieldInfo.Key);
			newFieldSelect.addEventListener('change', function(event){newFieldInfo.Callback(event)});
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
		function getTireConfig(){
			return ridestyler.ajax.send({action:'vehicle/gettireoptiondetails', data:{VehicleConfigurations: [bestConfigurationId]}}).then(function(response){
				if(response && response.Details.length){
					vehicleModel.tire = '';

					let tireOptions = {Options: response.Details}

					tireOptionDetailsLookup = {};
					response.Details.forEach(detail => {
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
		function updateButton(){
			let url = options.url || '';

			if(url.indexOf('?') == -1) url += '?';
			else url += '&';

			const data = bestTireOptionDetails ? bestTireOptionDetails : {
				ConfigurationID: bestConfigurationId
			};

			if(options.apiKey){
				url += options.apiKey + "#";
				if(bestConfigurationId) url += "vc=" + bestConfigurationId;
				if(bestTireConfigId) url += "&to=" + bestTireConfigId;

				showButton(url, data);
			} else {
				getRSApiKey().then(function(apiKey){ 
					url += apiKey + "#"; 
					if(bestConfigurationId) url += "vc=" + bestConfigurationId;
					if(bestTireConfigId) url += "&to=" + bestTireConfigId;

					showButton(url, data);
				});
			}
		}

		/**
		 * Get the users RideStyler api key
		 * @returns {String}
		 */
		function getRSApiKey(){
			return new Promise(function(resolve){
				ridestyler.ajax.send({action:"ApiAccessKey/GetSharedKey"}).then(function(response){
					if(response){
						resolve(response.Key)
					}
				});
			});
		}

		/**
		 * Show the button that will direct users to showcase given a url to the showcase.
		 * @param {String}
		 */
		function showButton(url, data){
			removeStaticLoader();

			let confirmButton = document.createElement('a');

			confirmButton.href = url;

			if (!options.openInSamePage)
				confirmButton.target = '_blank';
			
			if(options.buttonText) confirmButton.innerHTML = options.buttonText;
			else confirmButton.innerHTML = "Browse wheels";

			if(options.buttonClasses) options.buttonClasses.map(btnClass => confirmButton.classList.add(btnClass)); //if user has super secret special button classes

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
		function destroyField(key){
			let fieldElement = tplEl.querySelector('select[name='+ key +']');

			if(key !== "make" && key !== "model"){ //if the key is not make or model, we just get rid of the selection completely
				if(tplEl.querySelector('select[name='+ key +']')){
					tplEl.removeChild(tplEl.querySelector('select[name='+ key +']').parentElement);
				}
			} else { //if the key is make or model, we just remove the select options
				let disabledEl = document.createElement('option');
				disabledEl.setAttribute('disabled', true);
				disabledEl.setAttribute('selected', true);
				disabledEl.innerHTML = key.charAt(0).toUpperCase() + key.substr(1, key.length);
				fieldElement.innerHTML = "";
				fieldElement.appendChild(disabledEl);
			}

		}

		document.addEventListener('DOMContentLoaded', function(){
			initializeWidget();
		});
	}

	window.QuickSelect = QuickSelect;
})();
