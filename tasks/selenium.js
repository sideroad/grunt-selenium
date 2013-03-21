/*
 * grunt-selenium
 * https://github.com/sideroad/grunt-selenium
 *
 * Copyright (c) 2013 sideroad
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var async = require('async'),
      exec = require('child_process').exec,
      spawn = require('child_process').spawn,
      jsdom = require('jsdom'),
      path = require('path'),
      fs = require('fs'),
      jquery = fs.readFileSync( path.join( __dirname, '/lib/jquery-1.9.1.min.js' ), 'utf8').toString(),
      seleniumjar = __dirname+'/lib/selenium-server-standalone-2.31.0.jar',
      browser,
      isSuccess = true,
      store = {},
      util = {
        camelize: function(str){
          return str.substr(0,1).toUpperCase() + str.substr(1);
        },
        // location : function(target){
        //   var type = this.camelize( target.split('=')[0] ),
        //       value = target.split('=')[1],
        //       el;
        //   type = ( type === 'Link' ) ? 'LinkText' : type;
        //   grunt.log.debug('location: elementBy'+type + ' ' + target );
        //   el = browser['elementBy' + type ].call(browser, value);
        //   return el;
        // },
        elementBy: function(target){
          var location = this.location(target);
          grunt.log.debug('elementBy: ' + target );
          return browser.element( location.type, location.value );
        },
        waitForElement: function(target){
          var location = this.location(target);
          grunt.log.debug('waitForElement: ' + target );
          return browser.waitForElement( location.type, location.value );
        },
        location : function(target){
          var type = target.split('=')[0],
              value = target.split('=')[1],
              el;
          type = {
            'css': 'css selector',
            'link': 'link text'
          }[type] || type;
          return {type: type, value: value};
        }
      },
      assert = {
        ok: function( cmd, actual, msg){
          grunt.log.debug( cmd + ': "' + actual + '" is ok? ' + msg );
          if(!actual){
            grunt.log.error('['+cmd+'] was failed '+msg );
            isSuccess = false;
          }
        },
        equal: function(cmd, actual, expected, msg){
          var pattern = new RegExp("^"+(expected.replace(/(\.|\[|\]|\:|\?|\^|\{|\}|\(|\))/g,"\\$1").replace(/\*/g,".*"))+"$");
          grunt.log.debug( cmd + ': "' + actual + '" is equal "' + expected + '"? ' + msg );

          if(!pattern.test(actual)) {
            grunt.log.error('['+cmd+'] was failed '+msg+'\n'+
                            '  actual  :'+actual+'\n'+
                            '  expected:'+expected);
            isSuccess = false;
          }
        }
      },
      cmd = {
        /*
         * Commands passed target, value arguments 
         */ 
        open: function(target){
          return this.then(function(){
            return browser.get(target);
          });
        },
        assertElementPresent: function( target, msg ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            assert.ok('assertElementPresent', el, '['+target+']'+msg );
          });
        },
        assertLocation: function( expected, msg ){
          return this.then(function(){
            return browser.execute('window.location.href');
          }).then(function( href ){
            assert.equal('assertLocation', href, expected, msg );
          });
        },
        assertText: function( target, expected, msg ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.text();
          }).then(function(text){
            assert.equal('assertText', text, expected, '['+target+']'+msg );
          });
        },
        assertTextPresent: function( expected, msg ){
          return this.then(function(){
            return browser.textPresent( expected, 'body' );
          }).then(function( isPresented ){
            assert.ok('assertTextPresent', isPresented, '['+expected+']'+msg );
          });
        },
        assertTitle: function( expected, msg){
          return this.then(function(){
            return browser.title();
          }).then(function(title){
            assert.equal( 'assertTitle', title, expected, msg );
            return browser.title();
          });
        },
        click: function( target ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            return browser.clickElement(el);
          });
        },
        clickAndWait: function( target ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            return browser.clickElement(el);
          });
        },
        deleteCookie: function( name ){
          return this.then(function(){
            return browser.deleteCookie(name);
          });
        },
        goBack: function(){
          return this.then(function(){
            return browser.back();
          });
        },
        goBackAndWait: function(){
          return this.then(function(){
            return browser.back();
          });
        },
        storeEval: function( script, name ){
          return this.then(function(){
            return browser.execute( script );
          }).then(function( result ){
            store[name] = result;
            return this;
          });
        },
        type: function( target, keys ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            return browser.type(el, keys);
          });
        },
        verifyText: function( target, expected, msg ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.text();
          }).then(function(text){
            assert.equal('verifyText', text, expected, '['+target+']'+msg );
          });
        },
        waitForElementPresent: function(target){
          return this.then(function(){
            return util.waitForElement(target);
          });
        }
      };

  grunt.registerMultiTask('selenium', 'Run selenium', function( data ) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
          browsers: ['firefox']
        }),
        done = this.async(),
        child,
        that = this;

    grunt.log.debug('Setup Selenium Server...');
    child = spawn('java',['-jar',seleniumjar]);

    child.stderr.on('data', function(data){
      grunt.log.error(''+data);
    });

    child.stdout.on('data', function(data){
      data = (''+data).replace(/\n$/,'');
      grunt.log.debug(data);
      if( !data.match('Started org.openqa.jetty.jetty.Server') ) {
        return;
      }
      var wd = require('wd'),
          promise;

      async.mapSeries( options.browsers, function(browserName, callback){
        grunt.log.writeln('Setup browser ['+browserName+']');
        browser = wd.promiseRemote();
        promise = browser.init({
          browserName: browserName,
          name: 'This is an example test'
        });
        that.files.forEach(function(f) {
          var suites = f.src.filter(function(filepath) {
            // Warn on and remove invalid source files (if nonull was set).
            if (!grunt.file.exists(filepath)) {
              grunt.log.warn('Source file "' + filepath + '" not found.');
              return false;
            } else {
              return true;
            }
          });

          async.mapSeries( suites, function( suite, callback ){
            grunt.log.writeln('  Running suite['+suite+']');

            jsdom.env({
              html: suite,
              src: [jquery],
              done: function(errors, window){
                var $ = window.$,
                    hrefs = [];

                $('a[href]').each(function(){
                  hrefs.push(this.href);
                });
                async.map( hrefs, function( href, callback ){
                  jsdom.env({
                    html: fs.readFileSync( href, 'utf8').toString(),
                    src: [jquery],
                    done: function(errors, window){
                      var $ = window.$,
                          testcase = $('thead tr td').html();
                      promise = promise.then(function(){
                        grunt.log.writeln( '    Running test case['+testcase+']' );
                      });
                      $('tbody').find('tr').each(function(){
                        var $tr = $(this),
                            command = $tr.find('td:eq(0)').html(),
                            target = $tr.find('td:eq(1)').html(),
                            value = $tr.find('td:eq(2)').html();
                        promise = ( 
                          cmd[command]||
                          function( target, value ){
                            grunt.log.warn('Command not supported['+command+']');
                            return this;
                          }
                        ).apply( promise, [ target, value ] );
                      });
                      promise = promise.then(function(){
                        grunt.log.writeln('    Finish  test case['+testcase+']');
                        callback(promise);
                      });
                    }
                  });
                }, function( err, results ){
                  promise = promise.then(function(){
                    store = {};
                    grunt.log.writeln('  Finish suite['+suite+']');
                    callback();
                  });
                });
              }
            });
          }, function(){
            promise = promise.then(function(){
              grunt.log.writeln('Teardown browser ['+browserName+']');
              return browser.quit();
            }).fin(function(){
              callback();
            }).done();
          });
        });
      }, function(){          
        child.kill();
        done(isSuccess);
      });
    });
  });
};
