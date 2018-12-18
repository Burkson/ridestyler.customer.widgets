var gulp = require('gulp'); // https://gulpjs.com/
var sourcemaps = require('gulp-sourcemaps'); // https://github.com/gulp-sourcemaps/gulp-sourcemaps
var typescript = require('gulp-typescript'); // https://github.com/ivogabe/gulp-typescript
var mergeStreams = require('merge2'); // https://www.npmjs.com/package/merge2
var browserSync = require('browser-sync').create(); // https://browsersync.io/docs/gulp
var concat = require('gulp-concat'); // https://github.com/contra/gulp-concat
var sass = require('gulp-sass'); // https://github.com/dlmanning/gulp-sass
var sassTypes = require('node-sass').types; // https://github.com/sass/node-sass#functions--v300---experimental
var gulpFile = require('gulp-file'); // https://github.com/alexmingoia/gulp-file
var del = require('del'); // https://github.com/sindresorhus/del
var babel = require('gulp-babel'); // https://github.com/babel/gulp-babel 
var uglify = require('gulp-uglify'); // https://github.com/terinjokes/gulp-uglify
var gulpIf = require('gulp-if'); // https://github.com/robrich/gulp-if
var autoprefixer = require('autoprefixer'); // https://github.com/postcss/autoprefixer
var cssnano = require('cssnano'); // http://cssnano.co/
var postcss = require('gulp-postcss'); // https://github.com/postcss/gulp-postcss
var gulpOptions = require('gulp-options'); // https://github.com/thomaschampagne/gulp-options
var stream = require('stream'); // https://nodejs.org/api/stream.html
var fs = require('fs'); // https://nodejs.org/api/fs.html
var iconfont = require('gulp-iconfont'); // https://github.com/nfroidure/gulp-iconfont
var consolidate = require('consolidate'); // https://github.com/tj/consolidate.js
var async = require('async'); // https://caolan.github.io/async/
var through = require('through2'); // https://github.com/rvagg/through2


/**
 * If true, dev mode is enabled, skip minification and output sourcemaps
 */
var dev = false;

var runTimestamp = Math.round(Date.now()/1000);

if (gulpOptions.has('production') || gulpOptions.has('prod')) {
    let production = gulpOptions.get('production') || gulpOptions.get('prod');
        production = production || 'false';
        production = production === 'true';
        
    dev = !production;
}

if (dev) console.log('Build using dev mode');
else console.log('Build using production mode');

var typescriptProject = typescript.createProject('tsconfig.json');

var polyfills = [
    './node_modules/babel-polyfill/dist/polyfill.js',
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
    '../vehicle-selection-modal/scripts/rsvsm.js',
    '../vehicle-renderer/js/rsvr.js'
];

var paths = {
    sources: {
        typescript: typescriptProject.config.include,
        sass: [
            'src/styles/**/*.scss'
        ],
        index: 'src/index.html',
        resources: [
            'src/images/**/*.{png,gif,jpg,svg}'
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
        external: 'dist/'
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
                "transform-remove-strict-mode",
            ]
        });
    },

    javascript: function () {
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
            typescriptJavascriptStream
        )
            .pipe(gulpIf(dev, sourcemaps.init({loadMaps: true})))
            .pipe(concat(paths.output.javascript))
            .pipe(gulpIf(!dev, uglify().on('error', console.error)))
            .pipe(gulpIf(dev, sourcemaps.write()))
            .pipe(gulp.dest(paths.output.folder));

        // Merge the streams (in parallel) so that this task is done when both of the below tasks are done
        return mergeStreams([
            typescriptDefinitionStream,
            javascriptStream
        ]);
    },
    css: function () {
        // Compile the icon sprite sheet first if it hasn't been already
        if (!fs.existsSync(paths.output.spriteSheet)) {
            let passthrough = through.obj();
            
            compiler.icons(function () {
                compiler.css().pipe(passthrough);
            });
            
            return passthrough;
        }

        return gulp.src(paths.sources.sass)
            .pipe(gulpIf(dev, sourcemaps.init()))
            .pipe(sass().on('error', sass.logError))
            .pipe(concat(paths.output.css))
            .pipe(postcss(dev ? [] : [
                autoprefixer({browsers: [
                    '> 1%',
                    'last 2 versions', 
                    'Firefox ESR',
                    'last 4 ie versions'
                ]}),
                cssnano()
            ]))
            .pipe(gulpIf(dev, sourcemaps.write('.')))
            .pipe(gulp.dest(paths.output.folder));
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
    return gulp.src([].concat(paths.sources.resources).concat(paths.sources.index), {
        base: paths.sources.folder
    }).pipe(gulp.dest(paths.output.folder));
});

gulp.task('build', ['js', 'css', 'resources']);

gulp.task('run', ['build'], function () {
    let port = 8080;
    let host = 'localhost';

    browserSync.init({
        server: {
            baseDir: paths.output.folder
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

    gulp.watch(paths.sources.index).on('change', browserSync.reload);

    gulp.watch(paths.sources.resources, ['resources']);
    
    gulp.watch(paths.sources.icons, ['icons']);

    gulp.watch(paths.sources.typescript, function () {
        browserSync.notify("<span color='goldenrod'>Compiling TypeScript to JS...</span>", 10 * 1000);
        
        return compiler.javascript().pipe(browserSync.reload({stream: true}));
    });
    
    gulp.watch(paths.sources.sass, function () {
        browserSync.notify("<span color='goldenrod'>Compiling SASS to CSS...</span>", 10 * 1000);

        return compiler.css(false).pipe(browserSync.stream({match: '**/*.css'}));
    });
});

gulp.task('clean', function (cb) {
    return del([
        "dist/**",
        paths.output.spriteMixins,
        paths.output.spriteSheet
    ]);
});

gulp.task('default', ['build']);