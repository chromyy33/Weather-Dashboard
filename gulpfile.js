const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Compile SCSS files to CSS
function buildCSS() {
  return src('*.scss') // Adjust the source path as needed
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('build')); // Output to build/css
}

// Copy HTML files to the build directory
function copyHTML() {
  return src('*.html') // Adjust the source path as needed
    .pipe(dest('build')); // Output to build
}

// Copy JavaScript files to the build directory
function copyJavaScript() {
  return src('scripts/*.js') // Adjust the source path as needed
    .pipe(dest('build')); // Output to build/js
}

// Watch for changes in SCSS, HTML, and JS files
function watcher() {
  watch('src/scss/*.scss', buildCSS); // Watch SCSS files
  watch('src/*.html', copyHTML); // Watch HTML files
  watch('src/scripts/*.js', copyJavaScript); // Watch JS files
}

// Define the default task
exports.default = series(buildCSS, copyHTML, copyJavaScript, watcher);