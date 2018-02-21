# Vehicle Quick View
This script allows you to quickly implement a visualization modal into an existing website with minimal modifications. 

# Dependencies
This script requires the core RideStyler scripts to be included from the API as well as the vehicle-renderer widget.

# Getting Started
All of the RideStyler Widgets are designed to be as easy as possible to add to your website. Simply follow the step-by-step instructions outlined below.

## Add Script References
The first step is simply adding a reference to the RideStyler JavaScript API and the Vehicle Renderer script file.
```
<script src="http://api-alpha.ridestyler.net/js?DataType=jsonp"></script>
<script src="rsvr.js"></script>
<script src="rsqv.js"></script>
```

Next, we need to add the correct data attributes to all of the our elements that we want to trigger the visualization modal.
```
<button type="button" data-rsqv-wheel-pn="222CH-LT20515011118">Visualize</button>
```

Finally, we need to bind all of our even handlers to the elements.
```
rsqv.bind({
    vehicleDesc: '2012 Audi A5 Quattro'
});
```