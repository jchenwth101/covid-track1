// Gulp task variables
var autoprefixer =  require('gulp-autoprefixer');
var browserSync =   require('browser-sync').create();
var csscomb =       require('gulp-csscomb');
var cleanCss =      require('gulp-clean-css');
var babel =         require('gulp-babel');
var del =           require('del');
var gulp =          require('gulp');
var concat =        require('gulp-concat');
var postcss =       require('gulp-postcss');
var plumber =       require('gulp-plumber');
var sass =          require('gulp-sass');
var sourcemaps =    require('gulp-sourcemaps');
var uglify =        require('gulp-uglify');
var rename =        require('gulp-rename');
var wait =          require('gulp-wait');

// Path variables
var PATHS = {
    DIST: {
        BASE: './dist',
        ASSETS: './dist/assets',
        IMAGES: './dist/assets/img',
        VENDOR: './dist/assets/vendor'
    },
    BASE: {
        BASE: './',
        NODE: './node_modules'
    },
    SRC: {
        BASE: './',
        SCSS: './src/scss',
        HTML: './**/*.html',
        PAGES: './pages',
        JS: [
            './node_modules/bluebird/js/browser/bluebird.min.js',
            './src/js/**/*.js'
        ],
    },
    ASSETS: {
        BASE: './assets',
        CSS: './assets/css',
        JS: './assets/js',
        IMAGES: './assets/img/**/*.+(png|jpg|svg|gif)'
    }
}

// Clean directories
gulp.task('clean:dist', function() {
    return del([
        PATHS.DIST.BASE
    ]);
});


// BrowserSync init
function browserSyncInit(done) {
	browserSync.init({
        host: 'localhost',
        port: 3000,
        proxy: false,
		server: {
            baseDir: PATHS.SRC.BASE
        },
        startPath: 'pages/index.html'
	});
	done();
}

// BrowserSync callback
function browserSyncReload(done) {
	browserSync.reload();
	done();
}

// Watch for changes
function watch() {
    gulp.watch(PATHS.SRC.SCSS + '/**/*.scss', gulp.series('scss'));
    gulp.watch(PATHS.SRC.JS, gulp.series('js'));
    gulp.watch(PATHS.SRC.HTML, browserSyncReload);
};

// Compile SCSS
gulp.task('scss', function() {
    return gulp.src(PATHS.SRC.SCSS + '/theme.scss')
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('postcss-flexbugs-fixes')
        ]))
        .pipe(csscomb())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.ASSETS.CSS))
        .pipe(browserSync.reload({
            stream: true
        }));
});
  
// Minify CSS
gulp.task('minify:css', function() {
    return gulp.src(PATHS.ASSETS.CSS + '/theme.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCss())
        //.pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.DIST.BASE + '/assets/css'))
});

// Process JS file and return the stream
gulp.task('js', function () {
    return gulp.src(PATHS.SRC.JS)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('theme.js'))
        .pipe(gulp.dest(PATHS.ASSETS.JS))
        .pipe(browserSync.reload({
            stream: true
        }));
});
  
// Minify JS
gulp.task('minify:js', function() {
    return gulp.src(PATHS.ASSETS.JS + '/theme.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        //.pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.DIST.BASE + '/assets/js'))
});

// Copy HTML
gulp.task('copy:html', function() {
    return gulp.src(PATHS.SRC.PAGES + '/*')
        .pipe(gulp.dest(PATHS.DIST.BASE + '/pages'));
});

// Copy assets
gulp.task('copy:assets', function() {
    return gulp.src(PATHS.ASSETS.BASE + '/**/*')
        .pipe(gulp.dest(PATHS.DIST.ASSETS));
});

// Live sever
gulp.task('browserSync', gulp.series(browserSyncInit, watch));

// Default, development mode
gulp.task('default', gulp.series('scss', 'browserSync'));

// Production mode
gulp.task('build', gulp.series('clean:dist', 'copy:html', 'copy:assets', 'scss', 'minify:css', 'minify:js'));