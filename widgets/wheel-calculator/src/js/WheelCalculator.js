import Promise from 'promise-polyfill';

(function () {
	/**
	 * WheelCalculator: Render the Wheel Calculator widget within a container element
	 * @constructor
	 * @param {number} containerId - The id of the widget's parent element
	 * @param {Object} options - Optional arguments
	 */
	function WheelCalculator(containerId, options) {
		let diameterSelects,
			widthSelects,
			offsetSelects,
			wheels = [{Diameter:undefined, Width:undefined, Offset:undefined, Backspace:undefined}, {Diameter:undefined, Width:undefined, Offset:undefined, Backspace:undefined}],
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

			if(options && options.dev){
				tplUrl = "src/html/wc.tpl";
				cssUrl = "src/css/wc.css";
			}

		/**
		 * Runs when DOM content loaded. Load resources, then initialize UI.
		 */
		function onDomReady(){
			loadStyles().then(function(){
				loadTpl().then(function(){
					initializeUi();
				});
			});
		}

		/**
		 * load stylesheet from cdn
		 */
		function loadStyles(){
			return new Promise(function(resolve){
				let css = document.createElement('link');

				css.rel = "stylesheet";
				css.href = cssUrl;
				document.getElementsByTagName('head')[0].appendChild(css);

				css.onload = function(){
					resolve();
				}
			});
		}

		/**
		 * load tpl from cdn
		 */
		function loadTpl(){ 
			return new Promise(function(resolve){
				let xhr = new XMLHttpRequest();
	
				xhr.onreadystatechange = function() {
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
		function initializeUi(){
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

			if(options && options.disclaimer){
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
		function getWheelDiameters(){
			let count = 12,
				wheelDiameterMax = 30,
				wheelDiameters = [];

			while(count < wheelDiameterMax + 1){
				wheelDiameters.push(count);
				count++;
			}

			wheelDiameters.unshift("Diameter");

			populateField(diameterSelects[0], wheelDiameters)
			populateField(diameterSelects[1], wheelDiameters)
		}

		/**
		 * get wheel widths given the current diameter input, populate width select
		 * @param {DOMElement} element - diameter input elements
		 */
		function getWheelWidths(element){
			element = element.target;
			
			let nextEl = element.parentElement.nextElementSibling.children[0],
				count = 4,
				wheelWidthMax = 12.5,
				wheelWidths = [];

			while(count < wheelWidthMax + .5){
				wheelWidths.push(count);
				count+=.5;
			}

			wheelWidths.unshift("Width");

			populateField(nextEl, wheelWidths);
		}

		/**
		 * get wheel offsets given the current width input, populate offset select
		 * @param {DOMElement} element - width input element
		 */
		function getWheelOffsets(element){
			element = element.target;
			
			let nextEl = element.parentElement.nextElementSibling.children[0],
				count = -65,
				wheelOffetMax = 125,
				wheelOffsets = [];

			while(count < wheelOffetMax + 1){
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
		function populateField(field, dataArray){
			dataArray.forEach(function(data){
				let option = document.createElement('option');
				option.value = data;
				option.innerHTML = data;

				field.appendChild(option);
			});

			if(field.disabled) field.disabled = false;
		}

		/**
		 * call ridestyler api to compare two given wheels
		 */
		function getCompareData(){
			let requestData = {BaseSize:wheels[0].Diameter + "x" + wheels[0].Width + " ET" + wheels[0].Offset, "NewSizes[0]":wheels[1].Diameter + "x" + wheels[1].Width + " ET" + wheels[1].Offset}

			sendRequest("Wheel/CompareSizes", requestData).then(function(comparisonData){
				if(comparisonData){
					displayCompareData(comparisonData)
				}
			});
		}

		function displayCompareData(comparisonData){
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

			function verifyData(data, type, el){
				let returnData = data;

				if(type === "diff"){
					if(isNaN(parseInt(returnData)) === false){
						returnData = returnData.toFixed(2) + "%"
					}
				} else if(type === "message") {
					clearanceNotes.style.display = 'block';
					if(returnData.Type == 1){
						el.classList.remove('wc-error');
						el.classList.remove('wc-warning');
						el.classList.add('wc-warning');
					} else if(returnData.Type == 2){
						el.classList.remove('wc-error');
						el.classList.remove('wc-warning');
						el.classList.add('wc-error');
					} else {
						el.classList.remove('wc-error');
						el.classList.remove('wc-warning');
					}
					returnData = returnData.Message;
				}

				if(returnData !== undefined && el === undefined){
					return returnData;
				} else if(el !== undefined) {
					el.innerHTML = returnData;
				}
			}
		}

		/**
		 * Update our wheel object with new values
		 * @param {DOM Element} e - DOM element
		 */
		function updateWheelObject(e){
			let wheelElement = e.target,
				wheelIndex = wheelElement.id.charAt(wheelElement.id.length - 1),
				wheelValue = wheelElement.value;

			if(wheelElement.classList.contains('wc-firsti')){
				wheels[wheelIndex]["Diameter"] = wheelValue;
			} else if(wheelElement.classList.contains('wc-secondi')) {
				wheels[wheelIndex]["Width"] = wheelValue;
			} else {
				wheels[wheelIndex]["Offset"] = wheelValue;
				wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
			}

			if(wheels[0].Offset !== undefined && wheels[1].Offset !== undefined){
				getCompareData();
			}
		}

		/**
		 * Generate backspacing given the with and offset
		 * @param {int} width - width of wheel
		 * @param {int} offset - offset of wheel
		 */
		function getBackspacing(width, offset){
			let backSpacing,
				offsetInInches = mmToInches(offset),
				wheelCenter = parseInt(width / 2);

			backSpacing = (wheelCenter + offsetInInches);

			return backSpacing;
		}

		/**
		 * mm to inches
		 * @param {int} mm - mm measurement
		 */
		function mmToInches(mm) {
			let inches,
				mmToInch = 25.4;

			inches = parseInt((mm / mmToInch).toFixed(2));

			return inches;
		}

		/**
		 * Send ridestyler api request
		 * @param {string} endpoint - endpoint for request
		 * @param {object||formData} data - data to include in request
		 */
		function sendRequest(endpoint, data){
			return new Promise(function(resolve){
				ridestyler.ajax.send({
					action: endpoint,
					data: data,
					callback: function (res) {
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
		function addListeners(el, listener, cb){
			if(typeof el === "object" && Object.keys(el).length > 1 || typeof el === "array"){
				for(let e in el){
					if(typeof el[e] == "object") el[e].addEventListener(listener, cb);
				}
			} else {
				el.addEventListener(listener, cb);
			}
		}

		/**
		 * first select change
		 * @param {DOM Element} e - select element
		 */
		function onFirstChange(e){
			updateWheelObject(e);
			getWheelWidths(e);
		}

		/**
		 * second select change
		 * @param {DOM Element} e - select element
		 */
		function onSecondChange(e){
			updateWheelObject(e);
			getWheelOffsets(e);
		}

		/**
		 * third select change
		 * @param {DOM Element} e - select element
		 */
		function onThirdChange(e){
			updateWheelObject(e);
		}

		function toggleResults(e){
			if(e.target.id == "dims") {
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
			document.addEventListener("DOMContentLoaded", function(event) { 
				containerElement = document.getElementById(containerId);
				onDomReady();
			});
		} else {
			onDomReady();
		}
	}
	window.WheelCalculator = WheelCalculator;
})();
