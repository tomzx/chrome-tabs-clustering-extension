'use strict';

module.exports = {
	js: {
		src: [
			'src/js/app/app.js',
			'src/js/app/**/*.js',
		],
		dist: 'src/js/app.js',
		components: {
			src: [
				'src/js/vendor/jquery-1.11.0.js',
				'src/js/vendor/*.js',
			],
			dist : 'src/js/components.js',
		},
	},
};