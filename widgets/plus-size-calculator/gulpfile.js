var gulp = require('gulp'),
rename = require('gulp-rename'),
uglify = require('gulp-uglify'),
htmlclean = require('gulp-htmlclean'),
cssnano = require('gulp-cssnano');

var config = {
  distDir: './dist',
  srcDir: './src'
};

gulp.task('html', function() {
  return gulp.src(config.srcDir + '/html/psc.tpl')
    .pipe(htmlclean())
    .pipe(gulp.dest(config.distDir + '/html'));
});

gulp.task('min-css', function() {
  return gulp.src(config.srcDir + '/css/psc.css')
    .pipe(cssnano())
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/css'));
});

gulp.task('min-js', function() {
  return gulp.src(config.srcDir + '/js/psc.js')
    .pipe(uglify())
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('default', ['html', 'min-css', 'min-js']);
