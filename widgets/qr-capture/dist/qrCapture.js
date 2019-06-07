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
	}

	QrCapture.prototype.StartSession = function() {
		var self = this;
		var state;
		var returnData;

		self.SendRequest('http://localhost:50199/Session/Start', function(data){
				if(data != undefined && state == undefined){
					self.SessionStartModel = data;
					getSession(data)
					state = 0;
				}
		});

		function checkSessionState(session){
			if(session != undefined || session.Success == false){
				switch(session.state){
					case 1:
						if(typeof self.OnSessionStart == 'function'){
							if(state != 1){
								self.OnSessionStart(session)
								state = 1;
							}
							getSession(session)
						}
						break;
					case 2:
						if(typeof self.OnWaitingForUpload == 'function'){
							if(state != 2){
								self.OnWaitingForUpload(session);
								state = 2;
							}
							getSession(session);
						}
						break;
					case 3:
						if(typeof self.OnImageReady == 'function'){
							if(state != 3){
								session.wheelBoundInformation = parseData(session.wheelBoundInformation);
								self.OnImageReady(session);
								state = 3;
							}
						}
						break;
					case 4:
						if(typeof self.OnEnded == 'function'){
							if(state != 4){
								session.wheelBoundInformation = parseData(session.wheelBoundInformation);
								self.OnEnded(session);
								state = 4;
							}
						}
						break;
				}
			} else {
				getSession(returnData)
			}
		}

		function getSession(data){
			if(data.session){
				self.SendRequest('http://localhost:50199/Session/Get?id=' + data.session.id, checkSessionState);
			} else if(data.id) {
				self.SendRequest('http://localhost:50199/Session/Get?id=' + data.id, checkSessionState);
			}
		}

		function parseData(data){
			return JSON.parse(data);
		}
	}

	QrCapture.prototype.SendRequest = function(url, callback){
		var request = new XMLHttpRequest();

		request.addEventListener('readystatechange', function () {
			if (this.readyState !== 4) {
				return;
			} else {
				if (this.status === 200) {
					// Success
					callback(JSON.parse(this.responseText));
				} else {
					// Error
					callback({ Success: false, Code: 0, Message: this.statusText });
				}
			}
		});

		request.open("GET", url);
		request.send();
	}

	window.QrCapture = QrCapture;
})();
