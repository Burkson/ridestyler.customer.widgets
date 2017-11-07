# Wheel Builder
This script allows you to implement the Wheel Builder widget into your website

# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.

## Add Script References
The first step is simply adding references to the Wheel Builder and Layer Builder scripts into your site.
```
<script src="layer-builder/dist/js/layerBuilder.min.js"></script>
<script src="wheel-builder/dist/js/wheelBuilder.min.js"></script>
```

## Add a Container
Next, create a container div in your document to store the Wheel Builder widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```

## Initialize the Widget
Now we need to initialize the Wheel Builder widget. To do this, you need to pass it an array of 'layer stacks'. A layer stack has the following form:
```
{
	name: 'Wheel Preview',
	visible: true,
	selected: true,
	layers: [
		{name: 'base', label: 'Base', img: 'layers/base.png'},
		{name: 'bolts', img: 'layers/bolts.png'},
		{name: 'cap', img: 'layers/cap.png'},
		{name: 'cap-text', img: 'layers/cap-text.png'},
		{name: 'inside-barrel', img: 'layers/inside-barrel.png'},
		{name: 'lip-outer', img: 'layers/lip-outer.png'},
		{name: 'outer-barrel', img: 'layers/outer-barrel.png'},
		{
			name: 'spoke-face', 
			img: 'layers/spoke-face.png',
			options: [
				{
					name: 'Blue',
					color: '#0000FF'
				},
				{
					name: 'Red',
					color: '#FF0000'
				}
			]
		}
	]
}
```

The 'name' and 'layers' attributes are required. Each layer must have a name and an img attribute which specifies the path to the image to be displayed. 'visible' specifies whether the layer should be displayed in the stack selector and 'selected' determines whether the stack is initially selected in the preview pane. 

Pass the id attribute of the container specified above to the constructor along with your layer stacks
```
var wb = new WheelBuilder('container', layerStacks);
```
This will render a new instance of the Wheel Builder in your chosen container. 

## Use the widget
After the wheel builder is instantiated, use the `loaded` function with a callback to further work with the wheel builder. Here are some examples of operations you might perform with your Wheel Builder:
```
wb.loaded(function() {
	// Set the color of a layer on all stacks
	wb.setLayerColor('spoke-face', '#FF0000');

	// Get an data url image representation of a given layer stack
	var imgdata = wb.getImage('Wheel Preview');

	// Reset a layer on all stacks
	wb.resetLayer('spoke-face');

	// Reset all layers on all stacks
	wb.resetAllLayers();
});
```

# Documentation

## Options
Option | Type | Default | Description
------ | ---- | ------- | -----------
wheelDims | Array | ```null``` | The dimensions of the wheel preview pane in pixels
defaultLayerOpts | Array | ```null``` | Default options for each layer. If this option is specified and no explicit options are specified for a given layer, the layer will use these default options. 
cssUrl	| String or Boolean | ```null``` | Specify the url to a custom stylesheet. If omitted, the default stylesheet will be used. If set to false, no stylesheet will be used.
onCancel | Function | null | Provide a callback to be executed when the cancel button is clicked. The button will be hidden if no callback is provided.
onConfirm | Function | null | Provide a callback to be executed when the confirm button is clicked. The button will be hidden if no callback is provided.
cancelText | String | 'Cancel' | The display text of the cancel button
confirmText | String | 'Confirm' | The display text of the confirm button

#### Options example:
```
var defaultLayerOpts = [
	{
		name: 'Blue',
		color: '#0000FF'
	},
	{
		name: 'Red',
		color: '#FF0000'
	},
	{
		name: 'Green',
		color: '#008000'
	},
	{
		name: 'Yellow',
		color: '#FFFF00'
	}
];

var cancelCb = function() {
	console.log('Cancelling');
};

var confirmCb = function() {
	console.log('Confirming');
};

var wb = new WheelBuilder('container', layerStacks, {
	wheelDims: [300, 300], 
	defaultLayerOpts: defaultLayerOpts,
	cssUrl: 'css/mystyle.css',
	onCancel: cancelCb,
	onConfirm: confirmCb,
	cancelText: 'Back',
	confirmText: 'Done'
});
```

## API
See the [Wheel Builder Function Reference](wheelBuilder.md)

