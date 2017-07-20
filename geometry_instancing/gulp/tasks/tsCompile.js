/**
 * TypeScriptのコンパイルタスク
 *
 * @author ICS-Kano
 */

const config = require("../../build_config");
const webpackConfig = require('../../webpack.config.js');

const taskName = require("../taskName");

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const webpackStream = require("webpack-stream");
const webpack = require("webpack");

const sourcemaps = require("gulp-sourcemaps");

// TODO:webpak 2 fix

gulp.task(taskName.tsCompile, () => {
  return sourcemaps.init()
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(config.jsFolder))
});
