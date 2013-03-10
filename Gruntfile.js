/*
 * grunt-selenium
 * https://github.com/sideroad/grunt-selenium
 *
 * Copyright (c) 2013 sideroad
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Configuration to be run (and then tested).
    selenium: {
      options: {
        startURL : 'http://sideroad.secret.jp/',
        browsers: ['firefox', 'chrome']
      },
      suite: {
        files: {
          'example': ['test/source/*.suite']
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['selenium']);

};
