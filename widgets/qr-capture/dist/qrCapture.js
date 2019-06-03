(function() {

	/**
	* qrCapture: creates a session for the user to navigate Ridestyler's Snap API
	* @constructor
	*/

	function QrCapture() {
		this.OnSessionStart;
		this.OnWaitingForUpload;
		this.OnImageReady;
		this.OnEnded;
		this.SessionStartModel;

		this.StartSession();
	}

	QrCapture.prototype.StartSession = function() {
		var self = this;
		function start(){
			$.get('http://localhost:50199/Session/Start')
			.done(function (data) {
				self.CheckSessionStatus(data)
				self.SessionStartModel = data;
			});
		}

		this.LoadScripts(start);
	}

	QrCapture.prototype.CheckSessionStatus = function(sessionModel) {
		var self = this;
		var state;
		var myInterval = setInterval(getSession, 1500);

		function getSession(){
			$.get('http://localhost:50199/Session/Get', { id: sessionModel.session.id })
			.done(function (data) {
				switch(data.state){
					case 1:
						if(typeof self.OnSessionStart == 'function' && state != 1){
							self.OnSessionStart(data);
							state = 1;
						}
						break;
					case 2:
						if(typeof self.OnSessionStart == 'function' && state != 2){
							self.OnWaitingForUpload(data);
							state = 2;
						}
						break;
					case 3:
						if(typeof self.OnImageReady == 'function' && state != 3){
							self.OnImageReady(data);
							clearInterval(myInterval);
							state = 3;
						}
						break;
					case 4:
						if(typeof self.OnEnded == 'function' && state != 4){
							self.OnEnded(data);
							clearInterval(myInterval);
							state = 4;
						}
						break;
				}
			});
		}
	}

	QrCapture.prototype.CreateWheelBounds = function(wrapper, bounds) {
		var self = this;
		var parsedBounds = JSON.parse(bounds);
		wrapper.append(self.CreateWheelElement(parsedBounds.RelativeBounds[0].Bounds));
		wrapper.append(self.CreateWheelElement(parsedBounds.RelativeBounds[1].Bounds));
	}

	QrCapture.prototype.CreateWheelElement = function(bounds) {
		var wheel = document.createElement('div');
		wheel.className = 'wheel marker';
		wheel.style.left = (bounds.X * 100) + '%';
		wheel.style.top = (bounds.Y * 100) + '%';
		wheel.style.width = (bounds.Width * 100) + '%';
		wheel.style.height = (bounds.Height * 100) + '%';
		wheel.style.cssText += "-webkit-transform-origin: 50% 50%; transform-origin: 50% 50%; opacity: 1; background: rgba(255, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.5); box-sizing: border-box; position: absolute; border-radius: 50%;"

		return wheel;
	}

	QrCapture.prototype.CreateVehicleImage = function(userSelector, userSession) {
		var self = this;
		if(typeof userSelector == "string" && document.querySelector(userSelector) != null){
			console.log('test')
			var container = document.querySelector(userSelector);
			var vehicleWrapper = document.createElement('div');
			var vehicleImage = document.createElement('img')
			var wheelBoundsWrapper = document.createElement('div');

			vehicleWrapper.style.cssText = 'margin: 0px auto; position: relative; align-items: center; height: 100%; width: auto; background-color: white; display: inline-block;';
			wheelBoundsWrapper.style.cssText = 'height: 99%; width: 100%; position: absolute; top: 0;';

			self.GetOrientation(vehicleWrapper, userSession.imageOrientation);
			self.CreateWheelBounds(wheelBoundsWrapper, userSession.wheelBoundInformation)
			vehicleImage.src = userSession.imageData;
			container.append(vehicleWrapper);
			vehicleWrapper.append(vehicleImage);
			vehicleWrapper.append(wheelBoundsWrapper);
		}
	}

	QrCapture.prototype.CreateQR = function(userSelector){
		var self = this;
		if(typeof userSelector == "string" && document.querySelector(userSelector) != null){
			var qrImg = document.querySelector(userSelector);
			qrImg.src = "data:image/png;base64, " + self.SessionStartModel.captureQR;
		}
	}

	QrCapture.prototype.CreateLink = function(userSelector){
		var self = this;
		if(typeof userSelector == "string" && document.querySelector(userSelector) != null){
			var qrLink = document.querySelector(userSelector);
			qrLink.href = self.SessionStartModel.captureURL;
		}
	}

	QrCapture.prototype.GetOrientation  = function(wrapper, orientation) {
		var self = this;
		if (orientation == 6) {
			wrapper.style.cssText += 'transform: rotate(90deg) translate(12.3%);';
		} else if (orientation == 8) {
			wrapper.style.cssText += 'transform: rotate(-90deg) translate(12.3%);';
		} else if (orientation == 3) {
			wrapper.style.cssText += 'transform: rotate(180deg) translate(0%);';
		} else if (orientation == 0) {
			wrapper.style.cssText += 'transform: rotate(0deg);';
		}
	}

	QrCapture.prototype.LoadScripts = function(callback){
		var self = this;
		var interval = setInterval(function(){
			if(window.jQuery == undefined){
				var script = document.createElement('script');
				script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
				document.head.append(script);
			} else {
				clearInterval(interval);
				callback();
			}
		}, 100);
	}

	window.QrCapture = QrCapture;
})();
