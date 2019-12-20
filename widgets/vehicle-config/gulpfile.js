var gulp = require('gulp'),
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

gulp.task('html', function() {
  return gulp.src(config.srcDir + '/html/wc.tpl')
    .pipe(htmlclean())
    .pipe(gulp.dest(config.distDir + '/html'));
});

gulp.task('min-css', function() {
  return gulp.src(config.srcDir + '/css/wc.css')
    .pipe(cssnano())
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/css'));
});

gulp.task('build', () => {
  browserify({
    entries: './src/js/WheelCalculator.js',
    debug: true
  })
  .transform(babelify, {presets:['@babel/env']})
  .bundle()
  .pipe( source('./wc.js') )
  .pipe( gulp.dest('./dist/js') );

  return gulp.src('./dist/js/wc.js')

});

gulp.task('minify', () => {
  gulp.src('./dist/js/wc.js')
  .pipe( minify() )
  .pipe(gulp.dest('./dist/js'));

  return gulp.src('./dist/js/wc.min.js')
})

gulp.task('default', ['html', 'min-css', 'build', 'minify']);
