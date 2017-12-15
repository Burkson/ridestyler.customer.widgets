const gulp = require('gulp'); // https://gulpjs.com/
const gulpLog = require('gulp-messenger'); // https://github.com/gulpjs/gulplog
const sourcemaps = require('gulp-sourcemaps'); // https://github.com/gulp-sourcemaps/gulp-sourcemaps
const typescript = require('gulp-typescript'); // https://github.com/ivogabe/gulp-typescript
const mergeStreams = require('merge2'); // https://www.npmjs.com/package/merge2
const browserSync = require('browser-sync').create(); // https://browsersync.io/docs/gulp
const concat = require('gulp-concat'); // https://github.com/contra/gulp-concat
const sass = require('gulp-sass'); // https://github.com/dlmanning/gulp-sass
const sassTypes = require('node-sass').types; // https://github.com/sass/node-sass#functions--v300---experimental
const gulpFile = require('gulp-file'); // https://github.com/alexmingoia/gulp-file
const del = require('del'); // https://github.com/sindresorhus/del
const babel = require('gulp-babel'); // https://github.com/babel/gulp-babel
const uglify = require('gulp-uglify'); // https://github.com/terinjokes/gulp-uglify
const gulpIf = require('gulp-if'); // https://github.com/robrich/gulp-if
const autoprefixer = require('autoprefixer'); // https://github.com/postcss/autoprefixer
const cssnano = require('cssnano'); // http://cssnano.co/
const postcss = require('gulp-postcss'); // https://github.com/postcss/gulp-postcss
const gulpOptions = require('gulp-options'); // https://github.com/thomaschampagne/gulp-options
const stream = require('stream'); // https://nodejs.org/api/stream.html
const fs = require('fs'); // https://nodejs.org/api/fs.html
const iconfont = require('gulp-iconfont'); // https://github.com/nfroidure/gulp-iconfont
const consolidate = require('consolidate'); // https://github.com/tj/consolidate.js
const async = require('async'); // https://caolan.github.io/async/
const through = require('through2'); // https://github.com/rvagg/through2
const exec = require('child_process').execSync;

gulpLog.init({
    logToFile: false,
    timestamp: true
});

/**
 * If true, dev mode is enabled, skip minification and output sourcemaps
 */
var dev = true;

var runTimestamp = Math.round(Date.now()/1000);

if (gulpOptions.has('production') || gulpOptions.has('prod')) {
    let production = gulpOptions.get('production') || gulpOptions.get('prod');
        production = production || 'false';
        production = production === 'true';

    if (!production) gulpLog.log('Build using dev mode');
    else gulpLog.log('Build using production mode');

    dev = !production;
}

/**
 * If true bundle the CSS with the javascript file
 */
var bundleCSS = !dev;

if (gulpOptions.has('bundle-css')) {
    let bundleCSSOption = gulpOptions.get('bundle-css') || 'true';
    bundleCSS = bundleCSSOption === 'true';
}

var typescriptProject = typescript.createProject('tsconfig.json');

var polyfills = [
    './node_modules/classlist-polyfill/src/index.js',
    './node_modules/ie8/build/ie8.max.js',
    './node_modules/TinyAnimate/src/requestAnimationFrame.js'
];
var libraries = [
    './node_modules/nouislider/distribute/nouislider.js',
    './lib/qrcode.js',
    './node_modules/TinyAnimate/src/TinyAnimate.js',
    './node_modules/impetus/dist/impetus.js'
];
var widgets = [
    './node_modules/com.burkson.ridestyler.widgets/widgets/vehicle-selection-modal/scripts/rsvsm.js',
    './node_modules/com.burkson.ridestyler.widgets/widgets/vehicle-renderer/rsvr.js'
];

var paths = {
    sources: {
        typescript: typescriptProject.config.include,
        sass: [
            'src/styles/**/*.scss'
        ],
        resources: [
            'src/images/**/*.{png,gif,jpg,svg}',
            '!src/images/icons/**/*'
        ],
        folder: 'src/',
        icons: 'src/images/icons/**/*.svg'
    },

    output: {
        folder: 'dist',
        javascript: 'ridestyler.showcase.js',
        css: 'ridestyler.showcase.css',
        spriteSheet: 'src/styles/sprites.scss',
        spriteMixins: 'src/styles/_sprites.scss'
    },

    baseURLs: {
        cssRelative: '',
        external: 'https://cdn.rawgit.com/Burkson/com.burkson.ridestyler.widgets/{sha}/widgets/showcase/dist/'
    },

    server: "./"
};

var compiler = {
    /**
     * Stores the contents of the generated CSS file
     */
    generatedCSS: undefined,

    babel: function () {
        return babel({
            presets: ['env'],
            plugins: [
                "transform-remove-strict-mode"
            ]
        });
    },

    javascript: function () {
        // Compile the css into a JS file
        var cssBundledIntoJSFile;

        if (bundleCSS) {
            cssBundledIntoJSFile = through.obj();
            
            compiler.css(true).on('finish', function () {
                gulpFile('ridestyler.showcase.css.js',
                    "RideStylerShowcase.css = `" +
                    compiler.generatedCSS + "`;", 
                    {src: true}
                )
                    .pipe(gulpIf(dev, sourcemaps.init()))
                    .pipe(compiler.babel())
                    .pipe(gulpIf(dev, sourcemaps.write()))
                    .pipe(cssBundledIntoJSFile);
            });
        } else {
            cssBundledIntoJSFile = gulpFile('ridestyler.showcase.css.js', '');
            cssBundledIntoJSFile.end();
        }

        // Process the TypeScript files
        var typescriptStreams = 
            typescriptProject.src()
                .pipe(gulpIf(dev, sourcemaps.init()))
                .pipe(typescriptProject());
    
        // Output .d.ts files to dist/definitions
        var typescriptDefinitionStream = typescriptStreams.dts
            .pipe(concat('ridestyler.showcase.d.ts'))
            .pipe(gulp.dest(paths.output.folder));
        
        // Grab typescript generated js
        var typescriptJavascriptStream = typescriptStreams.js
            .pipe(compiler.babel())
            .pipe(gulpIf(dev, sourcemaps.write()));
    
        // Grab all additional JavaScript files
        var polyfillStream = gulp.src(polyfills);
        var widgetStreams = gulp.src(widgets);
        var libraryStreams = gulp.src(libraries);

        // Combine polyfills and then typescript js into one file
        var javascriptStream = mergeStreams(
            libraryStreams,
            widgetStreams,
            polyfillStream,
            typescriptJavascriptStream,
            cssBundledIntoJSFile
        )
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat(paths.output.javascript))
            .pipe(gulpIf(!dev, uglify().on('error', console.error)))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(paths.output.folder));
    
        // Merge the streams (in parallel) so that this task is done when both of the below tasks are done
        return mergeStreams([
            typescriptDefinitionStream,
            javascriptStream
        ]);
    },
    css: function (forBundle) {
        var baseURL;

        // Compile the icon sprite sheet first if it hasn't been already
        if (!fs.existsSync(paths.output.spriteSheet)) {
            let passthrough = through.obj();

            compiler.icons(function () {
                compiler.css(forBundle).pipe(passthrough);
            });

            return passthrough;
        }

        if (forBundle) {
            const commit = exec('git rev-parse --short master').toString().split('\n').join('');
            baseURL = paths.baseURLs.external.replace('{sha}', commit);
        } else {
            baseURL = paths.baseURLs.cssRelative;
        }
        
        gulpLog.log('Compiling CSS...');
        gulpLog.log('Using "' + baseURL + '" for external paths');

        return gulp.src(paths.sources.sass)
            .pipe(gulpIf(dev, sourcemaps.init()))
            .pipe(sass({
                functions: {
                    'assetURL($file)': function (file) {
                        return new sassTypes.String(baseURL + file.getValue());
                    }
                }
            }).on('error', sass.logError))
            .pipe(postcss(dev ? [] : [
                autoprefixer({browsers: [
                    '> 1%',
                    'last 2 versions', 
                    'Firefox ESR',
                    'last 4 ie versions'
                ]}),
                cssnano()
            ]))
            .pipe(concat(paths.output.css))
            .pipe(gulpIf(dev, sourcemaps.write('.')))
            .pipe(gulpIf(!forBundle, gulp.dest(paths.output.folder)))
            .on('data', function (file) {
                if (bundleCSS && file.path.endsWith(paths.output.css))
                    compiler.generatedCSS = file.contents.toString();
            });
    },
    icons: function (callback) {
        let fontName = 'RideStyler Showcase Icons';
        let iconFontStream = gulp.src(paths.sources.icons).pipe(iconfont({
            fontName: fontName,
            prependUnicode: true,
            timestamp: runTimestamp,
            formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],                
            normalize: true,
            fontHeight: 1500
        }));

        const originalCallback = callback;

        callback = function () {
            gulpLog.log('Finished compiling icons.');
            if (typeof originalCallback === 'function') originalCallback();
        };

        async.parallel([
            function outputMixins(cb) {
                iconFontStream.on('glyphs', function(glyphs, options) {
                    consolidate.lodash('src/images/icons/_sprite.template.scss', {
                        glyphs: glyphs,
                        fontName: fontName,
                        fontPath: 'fonts/',
                        cssClass: 'ridestyler-showcase-icon'
                    }, function (error, data) {
                        fs.writeFile(paths.output.spriteMixins, data, cb);
                    });
                });
            },
            function outputSass(cb) {
                iconFontStream.on('glyphs', function(glyphs, options) {
                    consolidate.lodash('src/images/icons/sprite.template.scss', {
                        glyphs: glyphs,
                        fontName: fontName,
                        fontPath: 'fonts/',
                        cssClass: 'ridestyler-showcase-icon'
                    }, function (error, data) {
                        fs.writeFile(paths.output.spriteSheet, data, cb);
                    });
                });
            },
            function outputFonts(cb) {
                iconFontStream.pipe(gulpIf('**/*.scss',
                    gulp.dest('.'),
                    gulp.dest('dist/fonts')))
                    .on('finish', cb);
            }
        ], callback);
    }
};

gulp.task('js', compiler.javascript);
gulp.task('css', ['icons'], function () {
    return compiler.css(false);
});
gulp.task('icons', function (done) {
    return compiler.icons(done);
});
gulp.task('resources', function () {
    return gulp.src(paths.sources.resources, {
        base: paths.sources.folder
    }).pipe(gulp.dest(paths.output.folder));
});

gulp.task('build', bundleCSS ? ['js', 'resources'] : ['js', 'css', 'resources']);

gulp.task('run', ['build'], function () {
    let port = 8080;
    let host = 'localhost';

    browserSync.init({
        server: {
            baseDir: paths.server
        },
        port: port,
        host: host,
        ghostMode: false,
        notify: {
            styles: [
                'display: none; ',
                'padding: 6px 15px 3px;',
                'font-size: 2em; ',
                'position: fixed;',
                'font-size: 0.8em;',
                'z-index: 9999;',
                'left: 0px;',
                'bottom: 0px;',
                'color: rgb(74, 74, 74);',
                'background-color: rgb(17, 17, 17);',
                'color: rgb(229, 229, 229);'
            ]
        },
        middleware: [
            function (req, res, next) {
                // Log any requests to the console;
                console.log(req.url);
                return next();
            }
        ]
    });

    gulp.watch("*.html").on('change', browserSync.reload);

    gulp.watch(paths.sources.resources, ['resources']);
    
    gulp.watch(paths.sources.icons, ['icons']);

    gulp.watch(paths.sources.typescript, function () {
        browserSync.notify("<span color='goldenrod'>Compiling TypeScript to JS...</span>", 10 * 1000);
        
        return compiler.javascript().pipe(browserSync.reload({stream: true}));
    });
    
    gulp.watch(paths.sources.sass, function () {
        browserSync.notify("<span color='goldenrod'>Compiling SASS to CSS...</span>", 10 * 1000);

        if (bundleCSS) return compiler.javascript().pipe(browserSync.reload({stream: true}));

        return compiler.css(false).pipe(browserSync.stream({match: '**/*.css'}));
    });
});

gulp.task('clean', function (cb) {
    return del([
        paths.output.folder + "/**",
        paths.output.spriteMixins,
        paths.output.spriteSheet
    ]);
});

gulp.task('default', ['build']);