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

		self.SendRequest('Session/Start', function(data){
				self.SessionStartModel = data;
				getSession(data.session.id)
				state = 0;
		});

		function checkSessionState(session){
				if(typeof session.wheelBoundInformation === 'string'){
						session.wheelBoundInformation = parseData(session.wheelBoundInformation);
				}

				switch(session.state){
					case 1:
						if(typeof self.OnSessionStart == 'function'){
							if(state != 1){
								self.OnSessionStart(session)
								state = 1;
							}
						}
						getSession(session.id);
						break;
					case 2:
						if(typeof self.OnWaitingForUpload == 'function'){
							if(state != 2){
								self.OnWaitingForUpload(session);
								state = 2;
							}
						}
						getSession(session.id);
						break;
					case 3:
						if(typeof self.OnImageReady == 'function'){
							if(state != 3){
								self.OnImageReady(session);
								state = 3;
							}
						}
						break;
					case 4:
						if(typeof self.OnEnded == 'function'){
							if(state != 4){
								self.OnEnded(session);
								state = 4;
							}
						}
						break;
				}
		}

		function getSession(sessionId){
				self.SendRequest('Session/Get?id=' + sessionId, checkSessionState);
		}

		function parseData(data){
				return JSON.parse(data);
		}
	}

	QrCapture.prototype.SendRequest = function(endpoint, callback){
		var request = new XMLHttpRequest();
		var url = 'http://ridestylercaptureapi-745226033.us-west-2.elb.amazonaws.com/' + endpoint;

		request.addEventListener('readystatechange', function () {
			if (this.readyState !== 4) {
				return;
			} else {
				if (this.status === 200) {
					// Success
					callback(JSON.parse(this.response));
				}
			}
		});

		request.open("GET", url);
		request.send();
	}

	window.QrCapture = QrCapture;
})();
