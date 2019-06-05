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
  "wheelBoundInformation":null
},
```

## Display the Vehicle Image 
Want to diplay the user's vehicle image? Here is an example of how you can do that:
```
qr.OnImageReady = function(Session){
  var Image = document.createElement('img'); //Create an image reference
  Image.src = Session.imageData; //Set the src of your Image
  document.body.append(Image); //Display the image
}

```

## Display the Vehicle Wheel Bounds
Not only can you display the user's vehicle, you can also display the wheel bounds that were created along with the vehicle, Here's how:
```
qr.OnImageReady = function(Session){
  var Container = document.createElement('div'); //Create a container for all of your elements to be stored in.
  Container.style.position = 'relative';
  Container.style.display = 'inline-block';
  
  var Image = document.createElement('img'); //Create an image reference
  Image.src = Session.imageData; //Set the src of your Image
  Container.append(Image); //Append vehicle image to container
  
  var wheelData = JSON.parse(Session.wheelBoundInformation); //Parse the wheel data that is in the form of a String.
  
  function displayWheelBounds(bouds){ //This function takes the wheel bound data and creates a div element.
    var wheel = document.createElement('div');
    wheel.style.left = (bounds.X * 100) + '%';
    wheel.style.top = (bounds.Y * 100) + '%';
    wheel.style.width = (bounds.Width * 100) + '%';
    wheel.style.height = (bounds.Height * 100) + '%';
    wheel.style.background = 'rgba(255, 0, 0, 0.5)';
    wheel.style.position = 'absolute';
    wheel.style.borderRadius = '50%';
    
    return wheel;
  }
  
  //append wheel bound element to the container
  Container.append(displayWheelBounds(wheelData.RelativeBounds[0].Bounds)); 
  Container.append(displayWheelBounds(wheelData.RelativeBounds[1].Bounds));
  
  //append container element to the body
  document.body.append(Container);
}

```

# Documentation
```

## API
See the [QR Capture Function Reference](qrCapture.md)
