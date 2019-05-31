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

## Add a Container
Next, create a container div in your document to store the QR Code. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```

## Initialize the Widget
Now we need to initialize the QR Capture widget. To do this, you need to pass it a container ID so it resembles the following:
```
var qr = new QrCapture('container');
```
This will render a new QR Code in your chosen container.

## Use the widget
After the QR Capture widget is instantiated, use these listeners to design your own events around the user's progress. Here are some examples of the listeners that are available to you:
```
qr.onSessionStart = function(){
// Runs right when you load the widget loads.
}
qr.onWaitingForUpload = function(){
// Runs when user reaches the Capture UI, after they scan the QR Code.
}
qr.onImageReady = function(){
// Runs when user confirms their image selection.

// This method will display the users image along with the wheel bounds. This can only be run within the 'onImageReady' 	listener, given the id of the container you want the image to be displayed in.
qr.displayImage('vehicle');

}
qr.onEnded = function(){
// Runs if user get's a time out on the Capture UI.
}
```

# Documentation

```

## API
See the [QR Capture Function Reference](qrCapture.md)
