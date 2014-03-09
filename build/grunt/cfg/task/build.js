'use strict';

var config = require('../config.js');

module.exports = {
	uglify: {
		debug_app: {
			files: {
				'src/js/app.js': config.js.src,
			},
			options: {
				mangle: false,
				compress: false,
				preserveComments: 'all',
				beautify: true,
				sourceMap: true,
			}
		},
		debug_components: {
			files: {
				'src/js/components.js': config.js.components.src,
			},
			options: {
				mangle: false,
				compress: false,
				preserveComments: 'all',
				beautify: true,
				sourceMap: true,
			}
		},
		release: {
			files: {
				'src/js/app.js': config.js.src,
				'src/js/components.js': config.js.components.src,
			},
			options: {
				report: 'min',
				preserveComments: 'some',
			}
		},
	},
};