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
      success: {
        files: {
         'test/actual/success.tap': ['test/source/success/*.suite']
        }
      },
      failed: {
        files: {
         'test/actual/failed.tap': ['test/source/failed/*.suite']
        },
        options: {
          force: true
        }
      },
      ci: {
        options: {
          startURL : 'http://sideroad.secret.jp/',
          browsers: ['phantomjs']
        },
        files: {
         'test/actual/ci.tap': ['test/source/success/*.suite']
        }
      }
    },

    clean: ['test/actual/*'],

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // By default, lint and run all tests.
  grunt.registerTask('test', ['clean', 'selenium', 'nodeunit']);
  grunt.registerTask('ci', ['clean', 'selenium:ci']);
  grunt.registerTask('default', ['selenium']);

};
