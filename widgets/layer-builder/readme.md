# Layer Builder
This script allows you to implement the Layer Builder widget into your website

# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.

## Add Script Reference
The first step is simply adding a reference to the Layer Builder script into your site.
```
<script src="layer-builder/dist/js/layerBuilder.min.js"></script>
```

## Add a Container
Next, create a container div in your document to store the Layer Builder widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```

## Initialize the Widget
Now we need to initialize the Layer Builder widget. Simply pass the id of the container to the constructor:
```
var lb = new LayerBuilder('container');
```

## Use the Widget
After you initialize the widget, you need to pass an array of layer objects to your Layer Builder instance. You can do this by using the `setLayers` method. Each layer object must specify `name` and `img` properties. Here is an example of what you might pass into the `setLayers` method:
```
var layers = [
	{name: 'base', label: 'Base', img: 'layers/base.png'},
	{name: 'bolts', img: 'layers/bolts.png'},
	{name: 'cap', img: 'layers/cap.png'},
	{name: 'cap-text', img: 'layers/cap-text.png'},
	{name: 'inside-barrel', img: 'layers/inside-barrel.png'},
	{name: 'lip-outer', img: 'layers/lip-outer.png'},
	{name: 'outer-barrel', img: 'layers/outer-barrel.png'}
];
lb.setLayers(layers);
```


The `setLayers` method returns a promise which will optionally execute a callback when it completes. You can use this to further manipulate the Layer Builder:
```
lb.setLayers(layers).done(function() {
	// Colorize some layers
	lb.setColor('inside-barrel', '#e80000');
	lb.setColor('outer-barrel', '#4286f4');

	// Reset the 'inside-barrel' layer to its original state
	lb.resetLayer('inside-barrel');

	// Reset all layers to their orignal states
	lb.resetAllLayers();

	// Get a data url representation of your entire layer stack, scaled or unscaled
	var img = lb.getImage('image/png');
	var unscaledImg = lb.getUnscaledImage('image/png');
});
```

# Documentation

## Options
Option | Type | Default | Description
------ | ---- | ------- | -----------
dimensions| Array | ```[250,250]``` | The overall dimensions of the layer container and max dimensions of each individual layer. 

Options example:
```
var lb = new LayerBuilder('container', {dimensions: [250, 250]});
```