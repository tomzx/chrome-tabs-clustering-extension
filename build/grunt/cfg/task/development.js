'use strict';

var _ = require('lodash');
var fs = require('fs');
var grunt = require('grunt');
var config = require('../config.js');

module.exports = {
	jshint: {
		options: {
			reporter: require('jshint-stylish')
		},
		all: {
			src: config.js.src
		}
	},

	watch: {
		jshint: {
			tasks: ['jshint:all'],
			files: config.js.src,
		},
		uglify_app: {
			tasks: ['uglify:debug_app'],
			files: config.js.src,
		},
		uglify_components: {
			tasks: ['uglify:debug_components'],
			files: config.js.components.src,
		},
	},
};