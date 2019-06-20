'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

const SOURCE = './src/**/*.js';

gulp.task('copyconfig', () => {
  return gulp.src('./config/config.yml')
    .pipe(gulp.dest('./build'));
});

gulp.task('babel', () => {
  return gulp.src(SOURCE)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('default', gulp.series('copyconfig', 'babel'));

gulp.task('watch', () => {
  gulp.watch('src/*', gulp.series('copyconfig', 'babel'));
});
