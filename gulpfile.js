var gulp = require('gulp');
var webpackstream = require('webpack-stream');
var webpack = require('webpack');

gulp.task('build', function() {
  return gulp.src(['public/js/controller.js'])
    .pipe(webpackstream({
      output: {
        filename: 'bundle.js'
      },
      plugins: [
        new webpack.ProvidePlugin({
          'd3': 'd3',
          'viz.chart': './chart',
          'viz.ui': './ui',
          'viz.data': './data',
          'viz.util': './util'
        }),
        new webpack.optimize.UglifyJsPlugin({minimize: true})
      ]
    }))
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('build-3219', function() {
  return gulp.src(
    [
      'public/js/controller-circle.js',
      'public/js/controller-donut.js',
      'public/js/controller-main.js',
      'public/js/controller-notification-dialog.js'
    ])
    .pipe(webpackstream({
      output: {
        filename: 'bundle-3219.js'
      },
      plugins: [
        new webpack.ProvidePlugin({
          'd3': 'd3',
          'moment': 'moment',
          'viz.chart': './chart',
          'viz.ui': './ui',
          'viz.data': './data',
          'viz.util': './util',
          '$': 'jquery'
        })
      ]
    }))
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('dev', function() {
  return gulp.src(['public/js/*.js'])
    .pipe(webpackstream({
      output: {
        filename: 'bundle.js'
      },
      plugins: [
        new webpack.ProvidePlugin({
          'd3': 'd3',
          'viz.chart': './chart',
          'viz.ui': './ui',
          'viz.data': './data',
          'viz.util': './util'
        })
      ]
    }))
    .pipe(gulp.dest('public/dist/'));
});
