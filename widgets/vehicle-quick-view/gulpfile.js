var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var cssbeautify = require('gulp-cssbeautify');
var uglify = require('gulp-uglify');

var config = {
  distDir: './dist',
};

gulp.task('css', function() {
  return gulp.src('./scss/rsqv.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cssbeautify())
    .pipe(gulp.dest(config.distDir + '/css'));
});

gulp.task('min-css', function() {
  return gulp.src('./scss/rsqv.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/css'));
});

gulp.task('min-js', function() {
  return gulp.src('./js/rsqv.js')
    .pipe(uglify())
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('default', ['css', 'min-css', 'min-js']);
