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
        startURL : 'http://sideroad.github.io/grunt-selenium/',
        browsers: ['firefox', 'chrome'],
        log: 'test/actual/wd.log'
      },
      success: {
        files: {
         'test/actual/success.tap': ['test/source/success/example3.suite']
        }
      },
      failed: {
        options: {
          force: true
        },
        files: {
         'test/actual/failed.tap': ['test/source/failed/*.suite']
        }
      },
      ci: {
        options: {
          browsers: ['phantomjs'],
          force: true
        },
        files: {
         'test/actual/ci.tap': ['test/source/success/*.suite', 'test/source/failed/*.suite']
        }
      }
    },

    clean: ['test/actual/*'],

    // Unit tests.
    nodeunit: {
      tests: ['test/selenium_test.js'],
      ci: ['test/ci_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // By default, lint and run all tests.
  grunt.registerTask('test', ['clean', 'selenium', 'nodeunit']);
  grunt.registerTask('ci', ['clean', 'selenium:ci', 'nodeunit:ci']);
  grunt.registerTask('default', ['clean', 'selenium']);

};
