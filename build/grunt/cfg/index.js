'use strict';

var grunt = require('grunt');

module.exports = {
	package: {
		pkg: grunt.file.readJSON('package.json'),
	},
	development: require('./task/development.js'),
	environment: require('./task/environment.js'),
	build: require('./task/build.js'),
	release: require('./task/release.js'),
	deploy: require('./task/deploy.js'),
};