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
    rename = require("gulp-rename"),
    sftp = require('gulp-sftp'),
    wiredep = require('wiredep').stream;

// сервер
gulp.task('connect', function() {
    connect.server({
        root: 'app',
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
  gulp.src('./app/less/index.less')
      .pipe(less({}))
      .pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'opera 12', 'Firefox 17', 'ie 7']}))
      .pipe(gulp.dest('./app/css'));
});

//копируем файлы
gulp.task('copy-index-html', function() {
  gulp.src('./app/index.html')
    // Perform minification tasks, etc here
      .pipe(gulp.dest('./dist'));
});

gulp.task('copy-fonts', function() {
  gulp.src('./app/fonts/*')
      .pipe(gulp.dest('./dist/fonts'));
});


gulp.task('copy-imgs', function() {
  gulp.src('./app/i/*')
      .pipe(gulp.dest('./dist/i'));
});


//приглядываем за файлами, вызываем релоады
gulp.task('watch', function () {
    gulp.watch(['./app/*.html'], ['html']);
    gulp.watch(['./app/css/*.css'], ['css']);
    gulp.watch(['./app/less/*.less'], ['less']);
});


//автоматическое подключение библиотек
gulp.task('wiredep', function () {
    gulp.src('./app/*.html')
        .pipe(wiredep({
            directory: './app/bower_components'
        }))
        .pipe(gulp.dest('./dist'));
});

// Очистка
gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false}).pipe(clean());
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

gulp.task('sftp', function () {
  return gulp.src('src/*')
      .pipe(sftp({
        host: '',
        user: '',
        pass: ''
      }));
});


//default
gulp.task('default', ['connect', 'watch']);