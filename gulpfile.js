const { src, dest, watch, series, parallel, task } = require('gulp');
const doodoo = require('./doodoo/gulpfile');
const lines = require('./lines/gulpfile');

// const webpack = require('webpack-stream');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const npmDist = require('gulp-npm-dist');

function browserSyncTask() {
	return browserSync.init({
		port: 8080,
		server: {
			baseDir: './',
		}
	});
}

const jsFiles = [
	'./src/**/*'
];

const libFiles = [
	'./doodoo/build/doodoo.min.js',
	'./lines/build/base.min.js',
	'./lines/build/game.min.js',
];


function jsTask() {
	return src(jsFiles)
		.pipe(sourcemaps.init())
		.pipe(concat('gme.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./src_maps'))
		.pipe(dest('./build'))
		.on('error', function handleError() {
			this.emit('end'); // Recover from errors
		})
		.pipe(browserSync.stream());
}

function libTask() {
	return src(npmDist(), { base: './node_modules' })
		.pipe(dest('./build/lib'));
}

// this seems to work but its slow as fuck
function doodooCopy() {
	return src(['./doodoo/build/**/*'])
		.pipe(dest('./build'))
		.pipe(browserSync.stream());
}

function linesCopy() {
	// choose just base and game later ...
	return src([
			'./lines/build/base.min.js', 
			'./lines/build/src_maps/base.min.js.map',
			'./lines/build/game.min.js',
			'./lines/build/src_maps/game.min.js.map',
			'./lines/build/lib/**/*',
		], { base: './lines/build/' })
		.pipe(dest('./build'))
		.pipe(browserSync.stream());
}

function watchTask(){
	watch(['./src/*.js', './css/*'], series(jsTask));
	watch('./doodoo/src/*.js', series(doodoo.exportTask, doodooCopy));
	watch(['./lines/classes/*.js', './lines/game/classes/*.js'], series(lines.exportTask, linesCopy));
}

function cacheBustTask(){
	var cbString = new Date().getTime();
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
}

task('jsTask', jsTask);
task('lib', series(libTask, doodoo.exportTask, lines.exportTask, doodooCopy, linesCopy));
task('build', series(jsTask));
task('watch', parallel('build', cacheBustTask, browserSyncTask, watchTask));
task('default', parallel('watch'));


