!function(){function t(){this.OnSessionStart,this.OnWaitingForUpload,this.OnImageReady,this.OnEnded,this.SessionStartModel}t.prototype.StartSession=function(){var t,e,n=this;function s(s){if(null!=s||0==s.Success)switch(s.state){case 1:"function"==typeof n.OnSessionStart&&(1!=t&&(n.OnSessionStart(s),t=1),o(s));break;case 2:"function"==typeof n.OnWaitingForUpload&&(2!=t&&(n.OnWaitingForUpload(s),t=2),o(s));break;case 3:"function"==typeof n.OnImageReady&&3!=t&&(s.wheelBoundInformation=i(s.wheelBoundInformation),n.OnImageReady(s),t=3);break;case 4:"function"==typeof n.OnEnded&&4!=t&&(s.wheelBoundInformation=i(s.wheelBoundInformation),n.OnEnded(s),t=4)}else o(e)}function o(t){t.session?n.SendRequest("http://localhost:50199/Session/Get?id="+t.session.id,s):t.id&&n.SendRequest("http://localhost:50199/Session/Get?id="+t.id,s)}function i(t){return JSON.parse(t)}n.SendRequest("http://localhost:50199/Session/Start",function(e){null!=e&&null==t&&(n.SessionStartModel=e,o(e),t=0)})},t.prototype.SendRequest=function(t,e){var n=new XMLHttpRequest;n.addEventListener("readystatechange",function(){4===this.readyState&&(200===this.status?e(JSON.parse(this.responseText)):e({Success:!1,Code:0,Message:this.statusText}))}),n.open("GET",t),n.send()},window.QrCapture=t}();