const gulp = require('gulp');
const newer = require('gulp-newer');

const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babel = require('babelify');

const del = require('del');

const browserSync = require('browser-sync');

const build_dir = "./dist/";

const postcss  = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const range = require('postcss-input-range');

const JS_GLOB = "./src/**/*.js";
function buildJS() {
  return browserify('./src/index.js', {debug: true})
    .transform(babel.configure({
      presets: [['env', {
        "targets": {
          "browsers": ["last 2 versions", "safari >= 7", "iOS >= 7"],
        },
      }]]
    }))
    .bundle()
    .on('error', function(err) { console.error(err.message); this.emit('end'); })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(build_dir));
}

const HTML_GLOB = "./src/**/*.html";
function copyHTML() {
  return gulp.src(HTML_GLOB)
    .pipe(gulp.dest(build_dir));
}

const STATIC_GLOB = "./src/static/**/*";
function copyStatic() {
  return gulp.src(STATIC_GLOB)
    .pipe(gulp.dest(build_dir + "static"));
}

const CSS_GLOB = "./src/**/*.css";
function buildCSS() {
  const plugins = [
    autoprefixer({ grid: false }),
    range(),
  ];
  return gulp.src(CSS_GLOB)
    .pipe(postcss(plugins))
    .pipe(gulp.dest(build_dir))
    .pipe(browserSync.stream());
}

function reload() {
  browserSync.reload();
  return Promise.resolve();
}

function watch() {
  gulp.watch(JS_GLOB, gulp.series(buildJS, reload));
  gulp.watch(HTML_GLOB, gulp.series(copyHTML, reload));
  gulp.watch(STATIC_GLOB, gulp.series(copyStatic, reload));
  gulp.watch(CSS_GLOB, buildCSS);

    browserSync.init({
      server: {
        baseDir: build_dir,
      },
      https: {
        "key": "/etc/letsencrypt/live/tom.shea.at/privkey.pem",
        "cert": "/etc/letsencrypt/live/tom.shea.at/fullchain.pem",
        "ca": "/etc/letsencrypt/live/tom.shea.at/chain.pem"
      },
      script: {
        domain: "https://tom.shea.at/dev"
      },
      socket: {
        socketIoClientConfig: {
          reconnectionAttempts: 10,
          path: "/dev/browser-sync/socket.io",
          transports: ['websocket']
        }
      },
      ghostMode: false,
      open: false,
    });
}

function clean() {
  return del(build_dir);
}

gulp.task(watch);
gulp.task(buildJS);
gulp.task(copyHTML);
gulp.task(copyStatic);
gulp.task(buildCSS);
gulp.task(clean);
gulp.task('buildAll', gulp.parallel('buildCSS', 'copyHTML', 'copyStatic', 'buildJS'));
gulp.task('dist', gulp.series('clean', 'buildAll'));
gulp.task('dev', gulp.series('dist', 'watch'));
