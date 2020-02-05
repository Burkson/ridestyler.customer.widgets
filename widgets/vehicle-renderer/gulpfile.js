var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var config = {
  distDir: './dist',
};

gulp.task('js', function() {
  return gulp.src('./js/rsvr.js')
    .pipe(rename({
      'suffix': '.latest'
    }))
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('min-js', function() {
  return gulp.src('./js/rsvr.js')
    .pipe(uglify())
    .pipe(rename({
      'suffix': '.latest.min'
    }))
    .pipe(gulp.dest(config.distDir + '/js'));
});

gulp.task('default', ['js', 'min-js']);
