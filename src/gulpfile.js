'use strict';

var http_public = '..';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var dependencies = [
];

// How many times the scripts task is fired
var scriptsCount = 0;

function bundleApp(isProduction) {
  scriptsCount++;
  // Browserify will bundle all our js files together in to one and will let
  // us use modules in the front end.
  var appBundler = browserify({
    entries: './es2015/main.js',
    debug: true
  });

  // If it's not for production, a separate vendors.js file will be created
  // the first time gulp is run so that we don't have to rebundle things like
  // react everytime there's a change in the js file
  if (!isProduction && scriptsCount === 1){
    // create vendors.js for dev environment.
    browserify({
      require: dependencies,
      debug: true
    })
        .bundle()
        .on('error', gutil.log)
        .pipe(source('vendors.js'))
        .pipe(gulp.dest(http_public + '/js/'));
  }
  if (!isProduction){
    // make the dependencies external so they dont get bundled by the
    // app bundler. Dependencies are already bundled in vendor.js for
    // development environments.
    dependencies.forEach(function(dep){
      appBundler.external(dep);
    });
  }

  appBundler
  // transform ES6 and JSX to ES5 with babelify
      .transform("babelify", {presets: ["es2015"]})
      .bundle()
      .on('error',gutil.log)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(http_public + '/js/'));
}

gulp.task('scripts:dev', function () {
  bundleApp(false);
});

gulp.task('scripts:prod', function (){
  bundleApp(true);
});

gulp.task('scripts:watch', function () {
  gulp.watch(['./es2015/*.js'], ['scripts:dev']);
});

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(http_public + '/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'scripts:dev']);