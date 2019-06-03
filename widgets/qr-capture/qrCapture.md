## Class: QrCapture
QrCapture: An app that generates a QR code for users to navigate to the RideStyler Snap API.

### var qr = new QrCapture();

Initiation of the widget.

### qr.OnSessionStart

Event listener that runs right when you load the widget loads.

### qr.OnWaitingForUpload  

Event listener that runs when user reaches the Capture UI.

### qr.OnImageReady

Event listener that runs when user confirms their image selection.

### qr.OnEnded

Event listener that runs if user get's a time out on the Capture UI.

### qr.CreateVehicleImage(Selector, Session);

Parmeters(Selector of container you want the image to be displayed in, Current session)

This method will display the users image along with the wheel bounds. This can only be run within the 'OnImageReady' listener, given the id of the container you want the image to be displayed in.

### qr.CreateQR();

This method will return a 'base64' string that when added to an image's src attribute will create a QR Code re-directing the user to RideStyler's Snap UI.

### qr.CreateLink();

This method will return a url string that when added to a link tag will re-direct users to RideStyler's Snap UI.

* * *
