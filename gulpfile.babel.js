"use strict";
//TODO Add task for vendors
//TODO Add task for images

import gulp from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';
import exorcist from 'exorcist';
import browserSync from 'browser-sync';
import watchify from 'watchify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import ifElse from 'gulp-if-else';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import sassLint from 'gulp-sass-lint';
import uncss from 'gulp-uncss';

/**
 Config paramaters for Gulp
*/
import config from './config';

const devBuild = (( config.environment || process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production');
const src = config.source[config.source.length - 1] == '/' ? config.source : `${config.source}/`;
//config.build[--config.build.length] error
const dest = config.build[config.build.length - 1] == '/' ? config.build : `${config.build}/`;
const assets = config.assets[config.assets.length - 1] == '/' ? config.assets : `${config.assets}/`;
const images = {
  in: src + (config.images[config.images.length - 1] == '/' ? config.images : config.images),
  out: dest + assets
};

const styles = {
  in: src + config.sass,
  watch: [`${src + config.sass.substring(0, (config.sass.lastIndexOf('/') + 1))}**/*`],
  out: dest + (config.css[config.css.length - 1] == '/' ? config.css : config.css + '/'),
  sassOpt: {
    outputStyle: config.sassOptions.outputStyle || 'compressed',
    imagePath: config.sassOptions.imagePath,
    precision: config.sassOptions.precision || 3,
    errLogToConsole: true
  }
//  //TODO low - Add option params for autoprefixer
//  //pleeeaseOpt: {
//  //  autoprefixer: {browsers: ['last 2 versions', '> 2%']},
//  //  rem: ['16px'],
//  //  pseudoElements: true,
//  //  mqpacker: true,
//  //  minifier: !devBuild
//  //}
};

const js = {
    in: src + (config.jsDir[config.jsDir.length - 1] == '/' ? config.jsDir + '**/*' : config.jsDir + '/**/*'),
    out: dest + config.jsDir,
    filename: config.jsName
  };

const syncOpt = {
  server: {
    baseDir: dest,
    index: config.syncOptions.index || 'index.html'

  },
  open: config.syncOptions.open || false,
  notify: config.syncOptions.notify || true
  //port: process.env.PORT || 3000
  //logFileChanges: false
};

const vendors = {
  in: src + (config.vendors[config.vendors.length - 1] == '/' ?
 `${config.vendors}**/*` : `${config.vendors}/**/*`),
  out: dest + (config.vendors[config.vendors.length - 1] == '/' ?
 config.vendors : config.vendors + '/'),
  watch: [src + (config.vendors[config.vendors.length - 1] == '/' ?
 config.vendors + '**/*' : config.vendors + '/**/*')]
};

const fonts = {
  in: src + (config.fonts[config.fonts.length - 1] == '/' ? config.fonts +
 '**/*' : config.fonts + '/**/*'),
  out: dest + (config.fonts[config.fonts.length - 1] == '/' ? config.fonts :
 config.fonts + '/'),
  watch: [src + (config.fonts[config.fonts.length - 1] == '/' ?
 config.fonts + '**/*' : config.fonts + '/**/*')]
};
/**
 *
 * */

// import it/eveything as an object to return objects and give it an alias to
// use as variable to create objects - string interpolation
import * as pkg  from './package.json';
log(`${pkg.name} ${pkg.version} ${config.environment} build`);

gulp.task('debug', [], () => {
  log(src)
  log(`devBuild\n${devBuild}\n\n`)
  log('dest\n'+dest+'\n\n')
  log('assets\n'+assets+'\n\n')
  log('images.in\n'+images.in+'\n\n')
  log('images.out\n'+images.out+'\n\n')
  log('styles.in\n'+styles.in+'\n\n')
  log('styles.out\n'+styles.out+'\n\n')
  log('styles.watch\n'+styles.watch+'\n\n')
  log('styles.sassOpt\n'+styles.sassOpt+'\n\n')
  log('syncOpt\n'+syncOpt+'\n\n')
  log('js.in\n'+js.in+'\n\n')
  log('js.out\n'+js.out+'\n\n')
  //log('js.filename\n'+js.filename+'\n\n')
  log('vendors.in\n'+vendors.in+'\n\n')
  log('vendors.out\n'+vendors.out+'\n\n')
  log('vendors.watch\n'+vendors.watch+'\n\n')
  log('fonts.in\n'+fonts.in+'\n\n')
  log('fonts.out\n'+fonts.out+'\n\n')
  log('fonts.watch\n'+fonts.watch+'\n\n')
})

const sync = browserSync.create();

/**
 * Custom functions
 */

function log(msg) {
  console.log(msg);
}

gulp.task('sass', ['sasslint'], () => {
  return gulp.src('src/sass/main.sass')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass(
      {
        //outputStyle: 'compressed'
      }
    )
    .on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/assets'));
});

gulp.task('sasslint', () => {
  //gulp.src([`${styles.watch}.s+(a|c)ss`, '!node_modules/**'])
  gulp.src([`src/sass/**/*.s+(a|c)ss`, '!node_modules/**'])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});
//gulp.task('sass:watch', () => {
//  gulp.watch('src/sass/**/*.sass', ['sass']);
//});

// Input file.
watchify.args.debug = true;
var bundler = browserify('src/js/app.js', watchify.args);

// Babel transform
bundler.transform(babelify.configure({
    sourceMapRelative: 'src'
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {
  return bundler.bundle()
    .on('error', function(error){
      console.error( '\nError: ', error.message, '\n');
      this.emit('end');
    })
    .pipe(exorcist('public/assets/js/bundle.js.map'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(ifElse(process.env.NODE_ENV === 'production', uglify))
    .pipe(gulp.dest('public/assets/js'));
}

//add Sass task here
gulp.task('default', ['transpile, sass']);

// add sass task that sass() but sasslint before
gulp.task('transpile', ['lint'], () => bundle());

gulp.task('lint', () => {
    return gulp.src(['src/**/*.js', 'gulpfile.babel.js'])
               .pipe(eslint())
               .pipe(eslint.format())
});

// added sass
gulp.task('serve', ['transpile', 'sass'], () => sync.init({ server: 'public' }))
gulp.task('js-watch', ['transpile'], () => sync.reload());
gulp.task('sass-watch', ['sass'], () => sync.reload());

gulp.task('watch', ['serve'], () => {
  gulp.watch('src/**/*', ['js-watch'])
  gulp.watch('src/sass/**/*.sass', ['sass-watch'])
  //gulp.watch('public/assets/style.css', sync.reload)
  gulp.watch('src/sass/**/*.sass', sync.reload)
  // add task for sass watch here
  gulp.watch('public/index.html', sync.reload)
})


//import gulp from 'gulp';
//import browserSync from 'browser-sync';
//const $ = require('gulp-load-plugins')({lazy: true});
//import del from 'del';
//const config = require('./config.js')();
//import plumber from 'gulp-plumber';
//import newer from 'gulp-newer';
//import jshint from 'gulp-jshint';
//import jade from 'gulp-jade';
//import concat from 'gulp-concat';
//import size from 'gulp-size';
//import uglify from 'gulp-uglify';
//import deporder from 'gulp-deporder';
//import postcss from 'gulp-postcss';
//import autoprefixer from 'autoprefixer';
//import lost from 'lost';
//import minifyCss from 'gulp-minify-css';
//import sourcemaps from 'gulp-sourcemaps';
//import compass from 'gulp-compass';
//import rename from "gulp-rename";
//import iconfont from 'gulp-iconfont';
//import iconfontCss from 'gulp-iconfont-css';
//import async from 'async';
//import consolidate from 'gulp-consolidate';
//import babel from 'gulp-babel';
//import gutil from 'gulp-util';
//import vinylSource from 'vinyl-source-stream';
//import buffer from 'vinyl-buffer';
//import babelify from 'babelify';
//import browserify from 'browserify';
//import watchify from 'watchify';
//import assign from 'lodash.assign';
//import exit from 'gulp-exit';
//import gulpif from 'gulp-if';
//import path from 'path';
//import responsive from 'gulp-responsive';





// *****************
//// add custom browserify options here
//var customOpts = {
//  entries: ['./source/assets/js/functions.js'],
//  debug: true,
//  transform: [babelify],
//  // require: { jquery: 'jquery-browserify' }
//};
//var opts = assign({}, watchify.args, customOpts);
//var b = watchify(browserify(opts));
//
//// add transformations here
//// i.e. b.transform(coffeeify);
//
//gulp.task('zarm', bundle); // so you can run `gulp js` to build the file
//b.on('update', bundle); // on any dep update, runs the bundler
//b.on('log', gutil.log); // output build logs to terminal
//
//function bundle() {
//  return b.bundle()
//      // log errors if they happen
//      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
//      .pipe(vinylSource('app.js'))
//      // optional, remove if you don't need to buffer file contents
//      .pipe(buffer())
//      // optional, remove if you dont want sourcemaps
//      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
//      // Add transformation tasks to the pipeline here.
//      .pipe(sourcemaps.write('./')) // writes .map file
//      .pipe(gulp.dest('./build/assets/js'))
//      //.pipe(browsersync().stream());
//}

//gulp.task('image', () => gulp.src(`${images.in}/*.{jpg,jpeg,png}`)
//                             .pipe(responsive({
//                                     // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
//                                     '*.jpg': [{
//                                         width: 320,
//                                         rename: { suffix: '-320px' }
//                                     },
//                                         {
//                                             width: 480,
//                                             rename: { suffix: '-480px' }
//                                         },
//                                         {
//                                             width: 768,
//                                             rename: { suffix: '-768px' }
//                                         },
//                                         {
//                                             width: 960,
//                                             rename: { suffix: '-960px' }
//                                         },
//                                         {
//                                             // Compress, strip metadata, and rename original image
//                                             rename: { suffix: '-1320px' }
//                                         }]
//
//                                     // Resize all PNG images to be retina ready
//                                     //'*.png': [{
//                                     //  width: 320
//                                     //},
//                                     //  {
//                                     //  width: 320 * 2,
//                                     //  rename: { suffix: '@2x' }
//                                     //}]
//                                 },
//                                 {
//                                     // Global configuration for all images
//                                     // The output quality for JPEG, WebP and TIFF output formats
//                                     quality: 70,
//                                     // Use progressive (interlace) scan for JPEG and PNG output
//                                     progressive: true,
//                                     // Strip all metadata
//                                     withMetadata: false
//                                 }))
//                             .pipe(gulp.dest(`${images.out}img`)));

//// rename and uglifies css into min.css
//gulp.task('rename:css', () => {
//    gulp.src('build/assets/css/main.css')
//        .pipe(minifyCss())
//        .pipe(rename({suffix: '.min'}))
//        .pipe(gulp.dest('build/assets/css/'));
//});

//// Compile Javascript files
//gulp.task('babel', function () {
//  // to compress Js, update variable environement in config.js to 'production'
//  if (devBuild) {
//    log('-----> Compiling Javascript for Development <-----')
//    return gulp.src(js.in)
//        .pipe(sourcemaps.init())
//        .pipe($.plumber())
//        .pipe($.newer(js.out))
//        .pipe($.jshint())
//        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
//        //.pipe($.jshint.reporter('fail'))
//        .pipe(babel())
//        .pipe($.concat(js.filename))
//        .pipe(sourcemaps.write('.'))
//        .pipe(gulp.dest(js.out));
//  } else {
//    log('-----> Compiling Javascript for Production <-----')
//    del([
//      dest + 'js/*'
//    ]);
//    return gulp.src(js.in)
//        .pipe(sourcemaps.init())
//        .pipe($.plumber())
//        .pipe(babel())
//        .pipe($.deporder())
//        .pipe($.size({title: 'Javascript In Size'}))
//        .pipe($.concat(js.filename))
//        .pipe($.stripDebug())
//        //.pipe($.uglify())
//        .pipe(rename({suffix: '.min'}))
//        .pipe($.size({title: 'Javascript Out Size'}))
//        .pipe(sourcemaps.write('.'))
//        .pipe(gulp.dest(js.out));
//  }
//})

//// Creates RWD images and gets icons from source directory
//gulp.task('build:images',['image','icons']);

////Update images on build folder
//gulp.task('icons', () => {

//    return gulp.src([`${images.in}/icons/**`],
//        {base: 'source/assets'})
//               .pipe($.newer(images.out))
//               .pipe(gulp.dest(images.out));
//    log('-> icons done! <-');
//});


//// Update Favicon on build folder
//gulp.task('favicon', () => gulp.src(source + config.favicon)
//                               .pipe($.newer(dest))
//                               .pipe(gulp.dest(dest)));


//gulp.task('iconfont', () => {
//    const fontName = 'icons';
//    const runTimestamp = Math.round(Date.now()/1000);
//    //TODO change base: to global var
//    gulp.src([fonts.in], {base: 'source/assets'})
//        .pipe(iconfontCss({
//            fontName,
//            path: 'source/sass/1-tools/_fonticon.scss',
//            targetPath: '../../../source/sass/5-custom/_fonticon.scss/',
//            fontPath: '../../assets/fonts/'
//        }))
//        .pipe(iconfont({
//            fontName,
//            formats: ['ttf','eot','woff','svg'],
//            normalize: true,
//            fontHeight: 1001,
//            prependUnicode: true, //
//            timestamp: runTimestamp// recommended opt
//        }))
//        .pipe(gulp.dest(fonts.out));
//    log('--> Iconfont D0ne!<--');
//});


// Build Task
// TODO include sassLint task
// TODO Once Browserify is hooked up remove vendors tasks which will be obsolete
//gulp.task('build', ['clean', 'jade', 'compass', 'babel', 'iconfont',
// 'favicon', 'build:images', 'watch']);

//// Watch Task
//// Task dependancy, watch is run when browsersync is finished ['browsersync']
//gulp.task('watch', ['browsersync'], () => {
//    // Watch for style changes and compile
//    gulp.watch([styles.watch], ['compass', browserSync.reload]);
//    // Watch for jade changes and compile
//    gulp.watch(views.watch, ['jade']);
//    // Watch for javascript changes and compile
//    //gulp.watch(js.in, ['babel']);
//    //TODO Remove watch task for js files as we are using browserify
//    gulp.watch(['source/js/main.js',js.in], ['babel', browserSync.reload]);
//    // Watch for new images and copy
//    gulp.watch(images.in, ['images']);
//    // Watch for new vendors and copy
//    //gulp.watch(vendors.watch, ['vendors']);
//    gulp.watch('source/assets/fonts/**/*.svg', ['iconfont']);
//    //gulp.watch('build/assets/css/main.css', ['postcss', browserSync.reload]);
//});

gulp.task('clean', () => {
  log('-> Cleaning build folder');
  //del([
  //    `${dest}*`
  //]);
  del([
    'public/*',
  ])
});


//TODO Update Help section with new tasks
gulp.task('help', () => {
    console.log('');
    console.log('======================== Help  ========================');
    console.log('');
    console.log('Usage: gulp [command]');
    console.log('The commands for the task runner are the following.');
    console.log('-------------------------------------------------------');
    console.log('       clean: Removes all the compiled files on ./build');
    console.log('          js: Compile the JavaScript files');
    console.log('        jade: Compile the Jade templates');
    console.log('        sass: Compile the Sass styles');
    console.log('      images: Copy the newer to the build folder');
    console.log('     favicon: Copy the favicon to the build folder');
    console.log('     vendors: Copy the vendors to the build folder');
    console.log('       build: Build the project');
    console.log('       watch: Watch for any changes on the each section');
    console.log('       start: Compile and watch for changes (for dev)');
    console.log('        help: Print this message');
    console.log(' browserSync: Start the browsersync server');
    console.log('========================================================');
    console.log('');
    console.log('========================================================');
    console.log('');
});
