var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('compress', function() {
  gulp.src(['src/js/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist'));
});
