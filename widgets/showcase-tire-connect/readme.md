# RideStyler Showcase Tire Connect Plugin

This plugin adds a "Build Wheel and Tire Package" button to the details of a wheel in the [RideStyler Showcase](https://github.com/Burkson/com.burkson.ridestyler.widgets/tree/master/widgets/showcase/)
interface.

# Installation

1. Add a reference to the plugin script after the showcase:

```html
<script src="ridestyler.showcase.js"></script>
<script src="plugin.js"></script>
```

2. Set the URL of the Tire Connect script:

```html
<script type="text/javascript">
    TireConnectPlugin.BaseURL = 'http://integritycarcare.com/tire-brands/#!wheel_service?';
</script>
```

# Parameters
|     Name     |                                            Description                                            |  Type   | Required |
| ------------ | ------------------------------------------------------------------------------------------------- | ------- | :------: |
| BaseURL      | The URL of the page containing the TireConnect widget                                             | string  |   Yes    |
| OpenInNewTab | If true, open the TireConnect page in a new tab, otherwise, (by default) open in the current tab. | boolean |    No    |


# Building

Run the build npm script:
```
npm run-script build
```

# Testing
Use the example index.html page.