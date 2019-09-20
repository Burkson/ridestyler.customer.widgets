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
		wheelOffsetOne,
		wheelOffsetTwo,
		wheelOffsetDiff;

		/**
		 * Runs when DOM content loaded. Load resources, then initialize UI.
		 */
		function onDomReady(){
			Promise.all([loadTpl, loadStyles]).then(function(){
				initializeUi();
			});
		}

		/**
		 * load stylesheet from cdn
		 */
		const loadStyles = new Promise(function(resolve){
			let css = document.createElement('link');
			css.rel = "stylesheet";
			css.href = cssUrl;
			document.getElementsByTagName('head')[0].append(css);

			css.onload = function(){
				resolve();
			}
		});

		/**
		 * load tpl from cdn
		 */
		const loadTpl = new Promise(function(resolve){
			let xhr = new XMLHttpRequest();
 
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
		function getWheelDiameters(){
			let count = 12,
			wheelDiameterMax = 30,
			wheelDiameters = [];

			while(count < wheelDiameterMax + 1){
				wheelDiameters.push(count);
				count++;
			}

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

			populateField(nextEl, wheelOffsets);
		}
		
		/**
		 * call ridestyler api to compare two given wheels
		 */
		function getCompareData(){
			sendRequest("Wheel/CompareWheels", "Comparison", {BaseWheel: wheel[0], NewWheel: wheel[1]}).then(function(comparisonData){
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
		 * Update our wheel object with new values
		 * @param {DOM Element} e - DOM element
		 */
		function updateWheelObject(e){
			let wheelElement = e.target,
			wheelIndex = wheelElement.id.charAt(wheelElement.id.length - 1);

			if(wheelElement.classList.contains('wc-firsti')){
				wheels[wheelIndex]["Diameter"] = wheelElement.value;
			} else if(wheelElement.classList.contains('wc-secondi')) {
				wheels[wheelIndex]["Width"] = wheelElement.value;
			} else {
				wheels[wheelIndex]["Offset"] = wheelElement.value;
				wheels[wheelIndex]["Backspace"] = getBackspacing(wheels[wheelIndex]["Width"], wheels[wheelIndex]["Offset"]);
			}

			if(wheels[0].Offset !== undefined && wheels[1].Offset !== undefined){
				isWheelsConfirmed = true;
			}
		}
		
		/**
		 * Display wheel data given the dom element with new value
		 * @param {object} wheelData - Object of new wheel data
		 */
		function displayWheelData(wheelData) {
			
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
		 * @param {string} getter - property you want to grab from result
		 * @param {object||formData} data - data to include in request
		 */
		function sendRequest(endpoint, getter, data){
			return new Promise(function(resolve){
				ridestyler.ajax.send({
					action: endpoint,
					data: data,
					callback: function (res) {
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
			getCompareData();
		}

		/**
		 * second select change
		 * @param {DOM Element} e - select element
		 */
		function onSecondChange(e){
			updateWheelObject(e);
			getWheelOffsets(e);
			getCompareData();
		}

		/**
		 * third select change
		 * @param {DOM Element} e - select element
		 */
		function onThirdChange(e){
			updateWheelObject(e);
			displayWheelData(e);
			getCompareData();

			if(isWheelsConfirmed){
				// displayDifferences();
				// generateDifferenceData();
			}
		}

		/**
		 * On window load DOM content
		 */
		window.addEventListener('DOMContentLoaded', function(){
			onDomReady();
			// initializeUi();
		});
	}
	window.WheelCalculator = WheelCalculator;
})();
