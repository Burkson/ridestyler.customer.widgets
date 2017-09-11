# Plus Size Calculator
This script allows you to quickly implement RideStyler Plus Size Calculator widget into your website. Simply include the script and initialize it. The script will take care of the rest.
**Note:** This widget requires that the RideStyler API script be included in your website as well as it is used for communicating with the API.
# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.
## Add Script References
The first step is simply adding a reference to the RideStyler JavaScript API and the Plus Size Calculator script.
```
<script src="http://api-alpha.ridestyler.net/js?DataType=json"></script>
<script src="psc.js"></script>
```
## Add a Container
Next, create a container div in your document to store the Plus Size Calculator widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```
## Initialize the Widget
Now we need to initialize the API and our Plus Size Calculator widget.

First, we will initialize the JavaScript API using our API key.
```
ridestyler.initialize({ Key: 'c028c54cf0c447c594a862de6ac85d1a' });
```

Finally, we initialize the Plus Size Calculator. Pass the id attribute of the container above to the constructor.
```
var psc = new PlusSizeCalculator('container');
```
You can pass an object of options to the constructor as well. Currently there is only one option, which is to specify a custom increment value for the Tire Speed Difference section. The default value is 10. To specify another value, for example 20, initialize the constructor like this: 
```
var psc = new PlusSizeCalculator('container', {mphIncrement: 20});
```
## Enjoy
That's it! The widget will render in the container specified and you can begin comparing tire sizes.