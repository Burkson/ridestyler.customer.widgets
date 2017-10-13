var gulp = require('gulp'),
rename = require('gulp-rename'),
uglify = require('gulp-uglify')

var config = {
  distDir: './dist',
  srcDir: './src'
};

gulp.task('min-js', function() {
  return gulp.src(config.srcDir + '/js/layerBuilder.js')
    .pipe(uglify())
    .pipe(rename({
      'suffix': '.min'
    }))
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('default', ['min-js']);
