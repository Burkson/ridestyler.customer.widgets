# Quick Select
This script allows you to quickly implement RideStyler Quick Select widget onto your website. Simply include the script and initialize it. The script will take care of the rest.
**Note:** This widget requires that the RideStyler API script be included in your website as well as it is used for communicating with the API.
# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.
## Add Script References
The first step is simply adding a reference to the RideStyler JavaScript API and the Quick Select script.
```
<script src="https://api.ridestyler.net/js?DataType=json&Key=YOURKEY"></script>
<script src="https://static.ridestyler.net/widgets/quick-select/edge/js/QuickSelect-min.js"></script>
```
## Add a Container
Next, create a container div in your document to store the Quick Select widget. Give it an id attribute, for example, "container".
```
<div id="container"></div>
```
Optionally, you might consder specifying a width, height, and border for your container. The widget's layout will change depending on your container's width, so play around with stylings until you get something that works for you. The following is a good starting point. Place this somewhere inside your document's `<head>` tag:
```
<style>
#container {
	width: 600px;
	margin: 0 auto;
	border: 1px solid #CCC;
}
</style>
```
## Initialize the Widget
Now we need to initialize our Quick Select widget. Make sure you include the url of the page that contains your showcase instance in the
settings of your initialization.
```
new QuickSelect('container', {url: 'https://your-url.com'});
```
## Additional Settings
Now that you have your widget initialized you can add some additional settings to customize the look of your configurator.

- buttonClasses will add any of the classes specified to the buttons in the widget

(Array) buttonClasses: ['btn', 'red-btn']; 

- includeStyles will add our custom styles to the widget

(Boolean) includeStyles: true;

- buttonText will add custom text onto the submit button

(String) buttonText: "Go to visualizer"

- titleText will add custom text onto the title of the widget

(String) titleText: "My super awesome vehicle configurator"

Example integration with additional settings:
```
new QuickSelect('container', { url: 'https://your-url.com', titleText: "this is a disclaimer", includeStyles: true, buttonClasses: ['btn', 'red-btn'] }  );
```
## Enjoy
That's it! The widget will render in the container specified.
