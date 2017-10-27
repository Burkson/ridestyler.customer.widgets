## Class: WheelBuilder
WheelBuilder: A customizable wheel building widget



### WheelBuilder.loaded(cb) 

When the app is loaded, execute a callback

**Parameters**

**cb**: `function`, The callback function


### WheelBuilder.selectStack(stackName) 

Select a stack and display it in the preview pane

**Parameters**

**stackName**: `string`, The newly selected stack name


### WheelBuilder.addLayerStack(ls) 

Add a stack of layers

**Parameters**

**ls**: `object`, Data represending the layer stack - see readme for data format


### WheelBuilder.setLayerColor(layerName, color, operation) 

Set the color for a layer by name

**Parameters**

**layerName**: `string`, The name of the layer to colorize

**color**: `string`, The color to which we are changing the layer

**operation**: `string`, The color operation being done ('multiply', 'screen', 'grayscale')


### WheelBuilder.setCtrlTitle(title) 

Set the title of the ctrl pane

**Parameters**

**title**: `string`, The title section of the ctrl pane


### WheelBuilder.resetLayer(layerName) 

Reset all layers with the given name to its original state

**Parameters**

**layerName**: `string`, The name of the layer to be reset


### WheelBuilder.resetAllLayers() 

Reset all layers to their original state


### WheelBuilder.getLayerStack(stackname) 

Get a layer stack by name

**Parameters**

**stackname**: `string`, Name of the stack to select

**Returns**: `object`, The layer stack corresponding to stackName

### WheelBuilder.setStackTitle(title) 

Set the title of the control pane

**Parameters**

**title**: `string`, The title to set


### WheelBuilder.getStackImage(stackName) 

Get the image data for the specified stack

**Parameters**

**stackName**: `string`, The name of the stack to export

**Returns**: `string`, A data:image string representing the stack



* * *










