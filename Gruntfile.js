'use strict';

var _ = require('lodash');
var moment = require('moment');
var cfg = require('./build/grunt/cfg');

module.exports = function(grunt) {
	grunt.log.writeln('%s - Loading external tasks...', moment().format());

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	grunt.log.writeln('%s - done!', moment().format());

	grunt.loadTasks('./build/grunt/tasks');
	grunt.initConfig(_.merge.apply({}, _.values(cfg)));

	function alias(name, tasks) {
		grunt.registerTask(name, tasks.split(' '));
	}

	// Build tasks
	alias('js:debug', 'uglify:debug_app uglify:debug_components jshint:all');
	alias('js:release', 'uglify:release');

	// Testing tasks
	alias('test', 'jshint:all');

	alias('build:debug', 'js:debug');
	alias('build:release', 'js:release');

	// Development tasks
	alias('dev', 'build:debug watch');

	// Continuous integration
	alias('ci', 'build:release test');

	alias('default', 'dev');
};