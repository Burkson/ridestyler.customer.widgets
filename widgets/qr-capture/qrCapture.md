## Class: QrCapture
QrCapture: An app that generates a QR code for users to navigate to the RideStyler Snap API.

### var qr = new QrCapture();

Initiation of the widget.

### qr.StartSession();

Creates new session for the widget. This method is needed to use the widget.

### qr.OnSessionStart = function(Session){}

Event listener that runs right when you load the widget loads. Session model can be used inside of the listener.

### qr.OnWaitingForUpload = function(Session){}  

Event listener that runs when user reaches the Capture UI. Session model can be used inside of the listener.

### qr.OnImageReady = function(Session){}

Event listener that runs when user confirms their image selection. Session model can be used inside of the listener.

### qr.OnEnded = function(Session){}

Event listener that runs if user get's a time out on the Capture UI. Session model can be used inside of the listener.

### qr.SessionStartModel = function(){}

This will return the initial session model that is created when StartSession method is run:

```
{
  captureQR: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABHQA",
  captureURL: "http://192.168.1.185:3000/Capture/CaptureUI?sessionID=6c79c813-2c3d-42e6-90b9-c7b92fc4c21b",
  session: {
    id: "6c79c813-2c3d-42e6-90b9-c7b92fc4c21b",
    imageData: null,
    state: 1,
    timestamp: "2019-06-05T20:32:40.7605385Z",
    wheelBoundInformation: null
  }
}
```

### Event listener session model

This is what the session model looks like when included as a parameter on the event listeners above:

```
session: {
  id: "6c79c813-2c3d-42e6-90b9-c7b92fc4c21b",
  imageData: null,
  state: 1,
  timestamp: "2019-06-05T20:32:40.7605385Z",
  wheelBoundInformation: null
}
```

* * *
