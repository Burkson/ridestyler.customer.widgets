# QR Capture
This script allows you to communicate with Ridestyler's AR Snap API.

# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.

## Add Script Reference
The first step is simply adding reference to the QR Capture script into your site. You can host the scripts yourself and include them like this:
```
<script type="text/javascript" src="src/js/qrCapture.js"></script>
```

Or you can load the script from a CDN like this:
```
<script type="text/javascript" src="ridestylerAPI...../qrCapture.js"></script>
```

## Initialize the Widget
Now we need to initialize the QR Capture widget:
```
var qr = new QrCapture();
```
This will create a new session and allow you to use our listener functions shown below.

## Use the widget
After the QR Capture widget is instantiated, use these listeners to design your own events around the user's progress. Pass in the parameter "Session" to gain access to the current session data. (Session data structure shown below). Here are some examples of the listeners that are available to you:
```
// The "SessionStart" method creates a new session that will be used throughout the widget.
qr.StartSession();

qr.OnSessionStart = function(Session){
// The "OnSessionStart" listener runs right when widget fully loads onto the page and a new session is created.

}

qr.OnWaitingForUpload = function(Session){
// The "OnWaitingForUpload" listener runs when a user reaches the Capture UI, after they scan the QR Code.

}

qr.OnImageReady = function(Session){
// The "OnImageReady" listener runs when a user confirms their image selection.

}

qr.OnEnded = function(Session){
// The "OnEnded" listener runs if a user get's a time out on the Capture UI.

}
```

## Session Model
Below is a model of the Session parameter that can be included in any of the listeners above:
```
"session":{
  "state":1,
  "timestamp":"2019-06-03T21:44:47.250494Z",
  "id":"1aa7768c-9c3a-49de-8562-5085f72e4013",
  "imageData":null,
  "imageOrientation":0,
  "wheelBoundInformation":null
},
```

# Documentation

```

## API
See the [QR Capture Function Reference](qrCapture.md)
