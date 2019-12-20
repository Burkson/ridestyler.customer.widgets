// import Promise from 'promise-polyfill';

(function () {
	/**
	 * Vehicle Configuration: Render the Vehicle Configuration widget within a container element
	 * @constructor
	 * @param {number} containerId - The id of the widget's parent element
	 * @param {Object} options - Optional arguments
	 */
	function VehicleConfiguration(containerId, options) {
		let vehicleModel = {},
			cdnUrl = options.devMode ? './src/' : 'https://static.ridestyler.net/widgets/vehicle-configuration/edge/',
			tplUrl = cdnUrl + 'html/vc.tpl',
			cssUrl = cdnUrl + 'css/vc.css',
			tplEl = null,
			container = null,
			bestConfigurationId = null,
			bestTireOption = null;

		options = options || {};

		/**
		 * Load our template and styles if specified. Add event listeners to our selects.
		 */
		function initializeWidget(){
			initializeContainer();
			loadTpl().then(function(){
				if(options.includeStyles) loadStyles();
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
		 * Load the Vehicle configuration tpl
		 */
		function loadTpl() {
			return new Promise(function(resolve){
				let xhr = new XMLHttpRequest();
	
				xhr.onreadystatechange = function() {
					let completed = 4;
					if (xhr.readyState === completed) {
						if (xhr.status === 200) {
							container.innerHTML = xhr.responseText;
							tplEl = document.querySelector('#ridestyler-vehicle-config');
							resolve();
						} else {
							console.error('Vehicle configuration template failed to load.');
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
			link.src = cssUrl;
			document.head.appendChild(link);
		}

		/**
		 * Initialize our current vehicle selection selects with change event listeners
		 */
		function initializeUi(){
			let yearEl = tplEl.querySelector('select[name=year]'),
				makeEl = tplEl.querySelector('select[name=make]'),
				modelEl = tplEl.querySelector('select[name=model]');

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
				vehicleSelectRequest = {Selection:[]};
			
			if(currentEl){
				if(currentEl.target) currentEl = currentEl.target;
				currentSelection = currentEl.getAttribute('name');

				if(vehicleModel[currentSelection]) { // if the selection already exists
					vehicleModel[currentSelection] = currentEl.value;
					resetStepsAfter(currentSelection);
				} else { // else add it
					vehicleModel[currentSelection] = currentEl.value; 
				}
			}

			for(let property in vehicleModel){
				if(vehicleModel[property] != ""){
					if(property == 'tire') bestTireOption = vehicleModel[property];
					vehicleSelectRequest.Selection.push(
						property + ":" + vehicleModel[property]
					);
				}
			}

			if(currentSelection != 'tire'){
				ridestyler.ajax.send({ 
					action: 'Vehicle/Select',
					data: vehicleSelectRequest,
					callback: function(response){
						if(response){
							if(!vehicleModel[response.Menu.Key]){ //if key doesn't already exist, add it and populate the select field
								vehicleModel[response.Menu.Key] = "";
								populateVehicleOptions(response.Menu);
							} else if(response.BestConfiguration){
								bestConfigurationId = response.BestConfiguration.Value;
								getTireConfig();
							}
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
			
			if(tplEl.querySelector('button')) tplEl.removeChild(tplEl.querySelector('button'))
		}

		/**
		 * Populate a given select field with our given values
		 * @param {Object} newFieldInfo 
		 */
		function populateVehicleOptions(newFieldInfo, isTireOptions){
			let selectElement = null,
				fieldInfo = {};

			if(isTireOptions){ //if these are tire options we know we need to generate a new field with info not from the passed data
				fieldInfo = {Key: 'tire', Label: 'Tire Option', Callback: loadNextStep};
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
					if(newFieldInfo.Options.length == 1) optionEl.setAttribute('selected', true); //check if there is only one option, if so select it
				});	
			} 

			if(selectElement.value.indexOf('Select') == -1) loadNextStep(selectElement); //if there was only one option it's selected, move to next step.
		}

		/**
		 * Generate a new field given the name and new values
		 * @param {String} newFieldInfo 
		 * @param {Array} options 
		 */
		function generateNewField(newFieldInfo){
			let newFieldDiv = document.createElement('div'),
				newFieldSelect = document.createElement('select'),
				newFieldLabel = document.createElement('label'),
				defaultOption = document.createElement('option');

			defaultOption.innerHTML = "Select a " + newFieldInfo.Key;
			newFieldLabel.innerHTML = newFieldInfo.Label;
			newFieldSelect.setAttribute('name', newFieldInfo.Key);
			newFieldSelect.addEventListener('change', function(event){newFieldInfo.Callback(event)});
			newFieldSelect.appendChild(defaultOption);
			newFieldDiv.appendChild(newFieldLabel);
			newFieldDiv.appendChild(newFieldSelect);
			tplEl.appendChild(newFieldDiv);

			return newFieldSelect;
		}

		/**
		 * Shows availble tire configurations to the user
		 */
		function getTireConfig(){
			ridestyler.ajax.send({
				action: 'vehicle/gettireoptiondetails',
				data: {VehicleConfigurations: [bestConfigurationId]},
				callback: function(response){
					if(response && response.Details.length){
						let tireOptions = {Options: response.Details}
						populateVehicleOptions(tireOptions, true);
					} else {
						buildUrl();
					}
				}
			})
		}

		/**
		 * Build the url that will take users to the showcase with their configuration settings.
		 */
		function buildUrl(){
			let url = "http://app.ridestyler.net/showcase?"

			if(options.apiKey) url += options.apiKey + "#";
			else url += getRSApiKey();
			if(bestConfigurationId) url += "vc=" + bestConfigurationId;
			if(bestTireOption) url += "&to=" + bestTireOption;
			
			showButton(url);
		}

		/**
		 * Get the users RideStyler Api key
		 * @returns {String}
		 */
		function getRSApiKey(){

		}

		/**
		 * Show the button that will direct users to showcase.
		 */
		function showButton(url){
			let confirmButton = document.createElement('button');
			
			confirmButton.innerHTML = "See Wheels";

			confirmButton.addEventListener('click', function(){
				window.open(url);
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
				disabledEl.innerHTML = 'Select a ' + key;
				fieldElement.innerHTML = "";
				fieldElement.appendChild(disabledEl);
			}

		}

		document.addEventListener('DOMContentLoaded', function(){
			initializeWidget();
		})
	}
	window.VehicleConfiguration = VehicleConfiguration;
})();
