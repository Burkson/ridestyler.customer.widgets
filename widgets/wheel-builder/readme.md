# Wheel Builder
This script allows you to implement the Wheel Builder widget into your website

# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.
## Add Script References
The first step is simply adding references to the Wheel Builder and Layer Builder scripts into your site.
```
<script src="layer-builder/dist/js/layer-builder.min.js"></script>
<script src="wheel-builder/dist/js/wheel-builder.min.js"></script>
```
## Add a Container
Next, create a container div in your document to store the Wheel Builder widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```
## Initialize the Widget
Now we need to initialize the Wheel Builder widget. To do this, you need to pass it an array of 'lacker stacks'. A layer stack has the following form: 
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

After the wheel builder is instantiated, use the `loaded` function with a callback to further work with the wheel builder:
```
wb.loaded(function() {
	var imgdata = wb.getStackImage('Wheel Preview');
	console.log(imgdata);
});
```

# Documentation

## Options
Option | Type | Default | Description
------ | ---- | ------- | -----------
wheelDims | Array | ```[250,250]``` | The dimensions of the wheel preview pane in pixels
defaultLayerOpts | Array | ```null``` | Default options for each layer. If this option is specified and no explicit options are specified for a given layer, the layer will use these default options. 


Options example:
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

var wb = new WheelBuilder('container', layerStacks, {
	wheelDims: [500, 500], 
	defaultLayerOpts: defaultLayerOpts
});
```