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

		function start(data){
			self.SessionStartModel = data;
			self.CheckSessionStatus(data);
		}

		self.SendRequest('http://localhost:50199/Session/Start', start);
	}

	QrCapture.prototype.CheckSessionStatus = function(data) {
		var self = this;
		var state;
		var args = ['id', data.session.id];
		var returnData;

		var myInterval = setInterval(function(){
			self.SendRequest('http://localhost:50199/Session/Get?id=' + data.session.id, getSession);
		}, 1500);

		function getSession(returnData){
			switch(returnData.state){
				case 1:
					if(typeof self.OnSessionStart == 'function' && state != 1){
						self.OnSessionStart(returnData);
						state = 1;
					}
					break;
				case 2:
					if(typeof self.OnSessionStart == 'function' && state != 2){
						self.OnWaitingForUpload(returnData);
						state = 2;
					}
					break;
				case 3:
					if(typeof self.OnImageReady == 'function' && state != 3){
						self.OnImageReady(returnData);
						clearInterval(myInterval);
						state = 3;
					}
					break;
				case 4:
					if(typeof self.OnEnded == 'function' && state != 4){
						self.OnEnded(returnData);
						clearInterval(myInterval);
						state = 4;
					}
					break;
			}
		}
	}

	QrCapture.prototype.SendRequest = function(url, callback){
		var request = new XMLHttpRequest();

		request.onload = function(){
			var data = JSON.parse(request.response)
			callback(data);
		}

		request.open("GET", url);

		request.send();
	}

	window.QrCapture = QrCapture;
})();
