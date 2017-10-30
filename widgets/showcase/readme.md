# RideStyler Showcase

## Installation
Run the following command to install all of the correct packages via [npm](https://www.npmjs.com/):
```npm install```

## Running Locally
To run the showcase locally use the following command:
```gulp run```

This will start up a web server pointed at the root showcase directory opening `index.html` which creates a new instance of the showcase widget and displays it.

Additionally changes to files in the `src` folder will be watched for and your browser refreshed as needed. Changes to TypeScript files will cause the browser to reload; changes to SASS files will be injected automatically.

## Building
To build a copy of the showcase use the following command:
```gulp build```

Whenever you run or build the showcase, a copy will be created in `dist` folder. By default, certain non-production build steps (such as minification and autoprefixer) are disabled and source maps are enabled. To enable the production build steps (and disable source maps) run the build command with the production flag:
```gulp build --production```

## Updating Packages
To update NPM packages (such as references to other widgets in `com.burkson.ridestyler.widgets`) run the following command:
```npm update```