# Vehicle Renderer
This script allows you to quicky implement RideStyler vehicle visualization into your website. Simply include the script and initialize it with the container you would like to contain the vehicle image. The script will take care of the rest.
**Note:** This widget requires that the RideStyler API script be included in your website as well as it is used for communicating with the API.
# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.
## Add Script References
The first step is simply adding a reference to the RideStyler JavaScript API and the Vehicle Renderer script file.
```
<script src="http://api-alpha.ridestyler.net/js?DataType=jsonp"></script>
<script src="rsvr.js"></script>
```
## Initialize the Widget
Next we need to initialize the API and our Vehicle Renderer widget.

First, we will initialize the JavaScript API using our API key
```
ridestyler.initialize({ Key: 'c028c54cf0c447c594a862de6ac85d1a' });
```

Next, we initialize the Vehicle Renderer by passing it a selector for our container element. This is the element in which you are planning to display the vehicle.
**Note:** The Vehicle Renderer element will automatically size to fit within your container element. It is important that your container element has a size.
```
var rsv = new RideStylerViewport('#container');
```
## Enjoy
That's it! You are ready to start rendering vehicles on your website. Check out the documentation below for instructions on how to utilize the Vehicle Renderer.

# Documentation