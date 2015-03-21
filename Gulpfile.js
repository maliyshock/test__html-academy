var gulp = require('gulp'),
    connect = require('gulp-connect'),
    autoprefixer = require('gulp-autoprefixer'),
    opn = require('opn'),
    concatCss = require('gulp-concat-css'),
    minifyCSS = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    less = require('gulp-less'),
    wiredep = require('wiredep').stream;

// сервер
gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: true
    });
    opn('http://localhost:8080/');
});

// как вызвана таска html, вызываем релоад
gulp.task('html', function () {
    gulp.src('./app/*.html')
        .pipe(connect.reload());
});

// как вызвана таска css, вызываем релоад
gulp.task('css', function () {
    gulp.src('./app/css/*.css')
        .pipe(connect.reload());
});

// лесс
gulp.task('less', function () {
    gulp.src('./less/**/*.less')
        .pipe(less({}))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./app/all.css'));
});


//приглядываем за файлами, вызываем релоады
gulp.task('watch', function () {
    gulp.watch(['./app/*.html'], ['html']);
    gulp.watch(['./app/css/*.css'], ['css']);
});


//автоматическое подключение библиотек
gulp.task('wiredep', function () {
    gulp.src('./app/*.html')
        .pipe(wiredep({
            directory: './app/bower_components'
        }))
        .pipe(gulp.dest('./app'));
});

// Очистка
gulp.task('clean', function () {
    return gulp.src('dist', {read: false}).pipe(clean());
});

// DIST !!!
gulp.task('dist', function () {
    var assets = useref.assets();
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});


//default
gulp.task('default', ['connect', 'watch']);