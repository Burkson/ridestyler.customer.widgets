var { src, series, dest } = require('gulp'),
rename = require('gulp-rename'),
htmlclean = require('gulp-htmlclean'),
cssnano = require('gulp-cssnano'),
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

function minCss() {
  return src(config.srcDir + '/css/qs.css')
    .pipe(cssnano())
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
exports.minCss = minCss;
exports.jsBuild = jsBuild;
exports.jsMinify = jsMinify;
exports.default = series(html, minCss, jsBuild, jsMinify);
