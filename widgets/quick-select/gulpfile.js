var { src, series, dest } = require('gulp'),
rename = require('gulp-rename'),
htmlclean = require('gulp-htmlclean'),
sass = require('gulp-sass'),
browserify = require("browserify"),
babelify = require("babelify"),
source = require("vinyl-source-stream"),
minify = require("gulp-minify");

var config = {
  distDir: './dist',
  srcDir: './src'
};

function html() {
  return src(config.srcDir + '/html/qs.tpl')
    .pipe(htmlclean())
    .pipe(dest(config.distDir + '/html'));
}

function minSass() {
  return src(config.srcDir + '/sass/qs.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(dest(config.distDir + '/css'));
}

function jsBuild(){
  browserify({
    entries: config.srcDir + '/js/QuickSelect.js',
    debug: true
  })
  .transform(babelify, {presets:['@babel/env']})
  .bundle()
  .pipe( source('./QuickSelect.js') )
  .pipe( dest(config.distDir + '/js') );

  return src(config.distDir + '/js/QuickSelect.js')
}

function jsMinify(){
  src(config.distDir + '/js/QuickSelect.js')
  .pipe( minify() )
  .pipe(dest(config.distDir + '/js'));

  return src(config.distDir + '/js/QuickSelect.js')
}

exports.html = html;
exports.minSass = minSass;
exports.jsBuild = jsBuild;
exports.jsMinify = jsMinify;
exports.default = series(html, minSass, jsBuild, jsMinify);
