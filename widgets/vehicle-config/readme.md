# Vehicle Configuration
This script allows you to quickly implement RideStyler Vehicle Configuration widget onto your website. Simply include the script and initialize it. The script will take care of the rest.
**Note:** This widget requires that the RideStyler API script be included in your website as well as it is used for communicating with the API.
# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.
## Add Script References
The first step is simply adding a reference to the RideStyler JavaScript API and the Wheel Calculator script.
```
<script src="https://api.ridestyler.net/js?DataType=json"></script>
<script src="https://static.ridestyler.net/widgets/vehicle-config/vc.js"></script>
```
## Add a Container
Next, create a container div in your document to store the Wheel Calculator widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```
Optionally, you might consder specifying a width, height, and border for your container. The widget's layout will change depending on your container's width, so play around with stylings until you get something that works for you. The following is a good starting point. Place this somewhere inside your document's `<head>` tag:
```
<style>
#container {
	width: 600px;
	height: 800px;
	margin: 0 auto;
	border: 1px dotted #CCC;
}
</style>
```
## Initialize the Widget
Now we need to initialize the API and our Vehicle Configuration widget.

First, we will initialize the JavaScript API using our API key.
```
ridestyler.initialize({ Key: 'API KEY' });
```

Finally, we initialize the Vehicle Configuration. Pass the id attribute of the container above to the constructor.
```
var wc = new VehicleConfiguration('container');
```
## Custom Disclaimer
You can add a custom disclaimer by adding the option on initialization:
```
var vc = new VehicleConfiguration('container', {message: "this is a disclaimer", styles: true, url: "https://your-url.com"}  );
```
## Enjoy
That's it! The widget will render in the container specified and you can begin comparing wheel sizes.
