(function() {

	/**
	* qrCapture: Produces a QR code that will direct users to Ridestylers Capture UI
	* @constructor
	* @param {string} containerId - The id of the container element
	*/

	function QrCapture(containerId) {
		this.userContainer = document.getElementById(containerId);
		this.qrImg = document.createElement('img'); this.qrImg.id = 'QR-img';
		this.userImage = document.createElement('img'); this.userImage.id = 'QR-userImage';
		this.wheelBoundsWrapper = document.createElement('div'); this.wheelBoundsWrapper.id = 'QR-wheelBoundsWrapper';
		this.vehicleWrapper = document.createElement('div'); this.vehicleWrapper.id = 'QR-vehicleWrapper';
		this.onSessionStart;
		self.onWaitingForUpload;
		this.onImageReady;
		this.onEnded;

		this.userContainer.append(this.qrImg);

		this.loadScripts();
	}


	QrCapture.prototype.startSession = function() {
		var self = this;
		$.get('http://localhost:50199/Session/Start')
		.done(function (data) {
			self.qrImg.src = "data:image/png;base64, " + data.captureQR;
			self.checkSessionStatus(data.session)
		});
	}

	QrCapture.prototype.checkSessionStatus = function(session) {
		var self = this;
		var state;
		var myInterval = setInterval(getSession, 1500);

		function getSession(){
			$.get('http://localhost:50199/Session/Get', { id: session.id })
			.done(function (data) {
				if (data.state == 1) {
					if(state != 1){
						self.onSessionStart();
					}
					state = 1;
				} else if (data.state == 2) {
					if(state != 2){
						self.onWaitingForUpload();
					}
					state = 2;
				} else if (data.state == 3) {
					if(state != 3){
						self.userImage.src = data.imageData;
						self.getOrientation(self.userImage, data.imageOrientation);
						self.createWheelBounds(data.wheelBoundInformation);
						self.onImageReady();
					}
					state = 3;
					clearInterval(myInterval);
				} else if (data.state == 4) {
					if(state != 3){
						self.onEnded();
					}
					state = 4;
					clearInterval(myInterval);
				} else {
					clearInterval(myInterval);
				}
			});
		}
	}

	QrCapture.prototype.createWheelBounds = function(r) {
		var data = JSON.parse(r);
		var self = this;
		self.wheelBoundsWrapper.append(self.createWheelElement(data.RelativeBounds[0].Bounds));
		self.wheelBoundsWrapper.append(self.createWheelElement(data.RelativeBounds[1].Bounds));
	}

	QrCapture.prototype.createWheelElement = function(bounds) {
		var wheel = document.createElement('div');
		wheel.className = 'wheel marker';
		wheel.style.left = (bounds.X * 100) + '%';
		wheel.style.top = (bounds.Y * 100) + '%';
		wheel.style.width = (bounds.Width * 100) + '%';
		wheel.style.height = (bounds.Height * 100) + '%';

		return wheel;
	}

	QrCapture.prototype.displayImage = function(imageContainer) {
			var self = this;
			var container = document.getElementById(imageContainer);
			container.append(self.vehicleWrapper);
			self.vehicleWrapper.append(self.wheelBoundsWrapper);
			self.vehicleWrapper.append(self.userImage);
	}

	QrCapture.prototype.getOrientation  = function(image, orientation) {
		var self = this;
		image.onload = function () {
			if (orientation == 6) {
				self.vehicleWrapper.style.cssText += 'transform: rotate(90deg) translate(12.3%);';
			} else if (orientation == 8) {
				self.vehicleWrapper.style.cssText += 'transform: rotate(-90deg) translate(12.3%);';
			} else if (orientation == 3) {
				self.vehicleWrapper.style.cssText += 'transform: rotate(180deg) translate(0%);';
			} else if (orientation == 0) {
				self.vehicleWrapper.style.cssText += 'transform: rotate(0deg);';
			}
		}
	}

	QrCapture.prototype.loadScripts = function(){
		var self = this;
		var interval = setInterval(function(){
			if(window.jQuery == undefined){
				var script = document.createElement('script');
				script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
				document.head.append(script);
			} else {
				clearInterval(interval);
				self.startSession();
			}
		}, 1000);
	}

	window.QrCapture = QrCapture;
})();
