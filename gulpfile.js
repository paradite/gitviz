var gulp = require('gulp');
var webpackstream = require('webpack-stream');
var webpack = require('webpack');

gulp.task('build', function() {
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
        }),
        new webpack.optimize.UglifyJsPlugin({minimize: true})
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
