const gulp = require('gulp'); //gulp基础库
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const htmlmin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const spriter = require('gulp-css-spriter');
const spritesmith = require('gulp.spritesmith');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const browserSync = require('browser-sync').create();
// const minifycss = require('gulp-minify-css'); //css压缩
const cleanCss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat'); //合并文件
const uglify=require('gulp-uglify');   //js压缩
const rename=require('gulp-rename');   //文件重命名
const jshint=require('gulp-jshint');   //js检查
const notify=require('gulp-notify'); //提示
const gulpif = require('gulp-if');//排除不想处理的文件
const sourcemaps = require('gulp-sourcemaps');
const pump = require('pump');

// 是否生产环境
global.production = true;
var condition = ['app/js/*.min.js'];
gulp.task('htmlmin', () => {
	return gulp.src('*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('minify'));
});
gulp.task('rev', () => {
	return gulp.src(['static/json/rev-manifest.json','*.html'])
		.pipe(revCollector({
			replaceReved: true,
		}))
		.pipe(gulp.dest('./'));
});
gulp.task('babelJs', () => {
	 pump([
	 	gulp.src(['app/js/*.js']),
		jshint(),
		gulpif(condition,babel()),
		rev(),
		gulp.dest('static/js'),
		rev.manifest(),
		gulp.dest('static/json'),
		browserSync.stream()
	])
});
gulp.task('testImagemin', () => {
	return gulp.src('app/img/*.{png,jpg,gif,ico}')
		.pipe(gulpif(!global.production,cache(imagemin({
			optimizationlevel: 2,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))))
		.pipe(gulp.dest('static/img'));
});
// gulp.task('sprite',() => {
// 	var spriteData = gulp.src('app/img/*.png').pipe(spritesmith({
// 		imgName: 'sprite.png',
// 		cssName: 'sprite.css',
// 		padding: 10
// 	}));
// 	return spriteData.pipe(gulp.dest('dist'));
// });
gulp.task('watch', () => {
	browserSync.init({
		server: './'
	});
	gulp.watch('*.html',['htmlmin']);
	gulp.watch('app/img/*.{{png,jpg,gif,ico}',['testImagemin']);
	gulp.watch('app/js/*.js',['babelJs']);
	gulp.watch('static/js/*.js',['minifyjs']);
	gulp.watch('app/css/*.scss',['sass']);
	gulp.watch('static/css/*.css',['cleanCss']);
	gulp.watch('*.html').on('change',browserSync.reload);
});
gulp.task('sass', () => {
	return gulp.src('app/css/*.scss')

		.pipe(sass())
		.pipe(spriter({
			'spriteSheet': 'static/img/spritesheet.png',
			'pathToSpriteSheetFromCSS': '../img/spritesheet.png'
		}))
		.pipe(gulp.dest('static/css'))
		.pipe(browserSync.stream());
});
gulp.task('cleanCss', () => {
	return gulp.src('static/css/*.css')
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(concat('order_query.css'))
		.pipe(gulp.dest('minify/css'))
		.pipe(rename({suffix:'.mix'}))
		.pipe(cleanCss({'compatibility': 'ie8'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('minify/css'))
		.pipe(browserSync.stream())
		.pipe(notify({message:'css task ok'}));
});
//JS处理
gulp.task('minifyjs',function(){
   return gulp.src(['static/js/*.js'])  //选择合并的JS
       .pipe(concat('order_query.js'))   //合并js
       .pipe(gulp.dest('minify/js'))         //输出
       .pipe(rename({suffix:'.min'}))     //重命名
       .pipe(uglify().on('error', function(e){
            console.log(e);
        }))                    //压缩
       .pipe(gulp.dest('minify/js'))    //输出
       .pipe(browserSync.stream())
       .pipe(notify({message:"js task ok"}));    //提示
});
gulp.task('default', ['sass','watch','babelJs','cleanCss','testImagemin','minifyjs','htmlmin']);