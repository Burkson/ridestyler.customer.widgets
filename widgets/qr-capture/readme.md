# QR Capture
This script allows you to implement the QR Capture widget into your website.

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
qr.OnSessionStart = function(Session){
// Runs right when you load the widget loads.

  // Returns a 'base64' string that when added to an image's src attribute will create a QR Code re-directing the user to RideStyler's Snap UI.
  var qrSrc = qr.CreateQR();

  // Creates a url string that when added to a link tag will re-direct user to RideStyler's Snap UI.
  var qrLink = qr.CreateLink();

}

qr.OnWaitingForUpload = function(Session){
// Runs when user reaches the Capture UI, after they scan the QR Code.
}

qr.OnImageReady = function(Session){
// Runs when user confirms their image selection.

  // This method will display the user's image along with the wheel bounds. This can only be run within the 'OnImageReady' listener, given the id of the container you want the image to be displayed in, and the current Session.
  qr.CreateVehicleImage('#vehicle', Session);

}

qr.OnEnded = function(Session){
// Runs if user get's a time out on the Capture UI.

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
