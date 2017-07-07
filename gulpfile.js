const gulp = require('gulp');
const sass = require('gulp-sass');
const beautify = require('gulp-jsbeautifier')

const tools = ['./gaps']
const sassFiles = '/sass/*.scss';
const cssFiles = '/css/*.css'

gulp.task('sass', function() {
    tools.forEach(tool => {
        return gulp.src(tool + sassFiles)
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(tool + '/css'));
    })
})

gulp.task('beautify', function() {
    tools.forEach(tool => {
        return gulp.src(tool + cssFiles)
            .pipe(beautify())
            .pipe(gulp.dest(tool + '/css'));
    })
});

gulp.task('watcher', function() {
    tools.forEach(tool => {
        gulp.watch(tool + sassFiles, ['sass']);
        gulp.watch(tool + cssFiles, ['beautify']);
    })
})
