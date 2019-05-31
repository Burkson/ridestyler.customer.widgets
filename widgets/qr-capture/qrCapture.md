## Class: QrCapture
QrCapture: An app that generates a QR code for users to navigate to the RideStyler Snap API.

### var qr = new QrCapture('container');

Initiation of the widget takes a container parameter where the QR code will be displayed.

### qr.onSessionStart

Event listener that runs right when you load the widget loads.

### qr.onWaitingForUpload  

Event listener that runs when user reaches the Capture UI, after they scan the QR Code.

### qr.onImageReady

Event listener that runs when user confirms their image selection.

### qr.onEnded

Event listener that runs if user get's a time out on the Capture UI.

### qr.displayImage('vehicle');

This method will display the users image along with the wheel bounds. This can only be run within the 'onImageReady' listener, given the id of the container you want the image to be displayed in.


* * *
