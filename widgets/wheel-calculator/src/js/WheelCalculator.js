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
				document.getElementsByTagName('head')[0].append(css);

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
				let xhr = new XMLHttpRequest(),
				container = document.getElementById(containerId);
	
				xhr.onreadystatechange = function() {
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
		function initializeUi(){
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
			dataArray.forEach(data => {
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
			let requestData = {BaseSize:wheels[0].Diameter + "x" + wheels[0].Width + "ET" + wheels[0].Offset, "NewSizes[0]":wheels[1].Diameter + "x" + wheels[1].Width + " ET" + wheels[1].Offset}

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

			if(wheelValue !== isNaN){}
			if(wheelElement.classList.contains('wc-firsti')){
				wheels[wheelIndex]["Diameter"] = wheelValue;
			} else if(wheelElement.classList.contains('wc-secondi')) {
				wheels[wheelIndex]["Width"] = wheelValue;
			} else {
				wheels[wheelIndex]["Offset"] = wheelValue;
				wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
			}

			if(wheels[0].Offset !== undefined && wheels[1].Offset !== undefined){
				isWheelsConfirmed = true;
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
			if(typeof el === "object" || typeof el === "array"){
				for(let e of el){
					e.addEventListener(listener, cb);
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
			if(wheels[1].Offset !== undefined){
				getCompareData();
			}
		}

		/**
		 * second select change
		 * @param {DOM Element} e - select element
		 */
		function onSecondChange(e){
			updateWheelObject(e);
			getWheelOffsets(e);
			if(wheels[1].Offset !== undefined){
				getCompareData();
			}
		}

		/**
		 * third select change
		 * @param {DOM Element} e - select element
		 */
		function onThirdChange(e){
			updateWheelObject(e);
			if(wheels[1].Offset !== undefined){
				getCompareData();
			}
		}

		/**
		 * On window load DOM content
		 */
		document.addEventListener("DOMContentLoaded", function(event) { 
			onDomReady();
			// initializeUi();
		});
	}
	window.WheelCalculator = WheelCalculator;
})();
