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
      spawn = require('simple-spawn').spawn,
      jsdom = require('jsdom'),
      path = require('path'),
      fs = require('fs'),
      _ = require('lodash'),
      jquery = fs.readFileSync( path.join( __dirname, '/lib/jquery-1.9.1.min.js' ), 'utf8').toString(),
      seleniumjar = __dirname+'/lib/selenium-server-standalone-2.33.0.jar',
      iedriver64 = __dirname+'/lib/IEDriverServer.x64.exe',
      iedriver86 = __dirname+'/lib/IEDriverServer.x86.exe',
      browser,
      isSuccess = true,
      storedVars = {},
      timeout,
      htmlpath,
      util = {
        elementBy: function(target){
          var location = this.location(target);
          grunt.log.debug('elementBy: ' + target );
          return browser.element( location.type, location.value );
        },
        location : function(target){
          var split = target.split('='),
              type = split.shift(),
              value = split.join('=').replace(/\&amp;/g,'&'),
              el;
          type = {
            'css': 'css selector',
            'link': 'link text'
          }[type] || type;
          if(/^\/\//.test(type)){
            value = type;
            type = 'xpath';
          }
          return {type: type, value: value};
        },
        restore: function(str){
          return str.replace(/\$\{([^\}]+)\}/g, function(whole, name){
            return storedVars[name];
          });
        },
        waitForElement: function(target){
          var location = this.location(target);
          grunt.log.debug('      waitForElement: ' + target );
          return browser.waitForElement( location.type, location.value, timeout );
        },
        waitForNotVisible: function(target){
          var location = this.location(target);
          grunt.log.debug('      waitForVisible: ' + target );
          return browser.waitForVisible( location.type, location.value, timeout );
        },
        waitForVisible: function(target){
          var location = this.location(target);
          grunt.log.debug('      waitForVisible: ' + target );
          return browser.waitForVisible( location.type, location.value, timeout );
        }
      },
      assert = {
        ok: function( cmd, actual, msg, tap){
          var is = 'ok';
          grunt.log.writeln('      '+ cmd + ': "' + actual + '" is ok? ' + msg );
          if(!actual){
            grunt.log.error('      ['+cmd+'] was failed '+msg );
            isSuccess = false;
            is = 'not ok';
            tap.fail++;
          } else {
            tap.pass++;
          }
          tap.data.push( is + ' ' + tap.index + ' - ' + tap.name + ' - ' + cmd + ' ' + msg);
          tap.index++;
        },
        equal: function(cmd, actual, expected, msg, tap){
          var pattern,
              is = 'ok';
          expected = util.restore(expected);
          pattern = new RegExp("^"+(expected.replace(/(\.|\:|\?|\^|\{|\}|\(|\))/g,"\\$1").replace(/\*/g,".*"))+"$");

          grunt.log.writeln( '      '+cmd + ': "' + actual + '" is equal "' + expected + '"? ' + msg );

          if(!pattern.test(actual)) {
            grunt.log.error('      ['+cmd+'] was failed '+msg+'\n'+
                            '        actual  :'+actual+'\n'+
                            '        expected:'+expected);
            isSuccess = false;
            is = 'not ok';
            tap.fail++;
          } else {
            tap.pass++;
          }
          tap.data.push( is + ' ' + tap.index + ' - ' + tap.name + ' - ' + cmd + ' ' + msg);
          tap.index++;
        }
      },
      cmd = {
        /*
         * Commands passed target, value arguments 
         */ 
        open: function(url){
          return this.then(function(){
            grunt.log.writeln('      open['+url+']');
            return browser.get(url);
          }).then(function(){
            return browser.source();
          }).then(function(html){
            if(htmlpath) {
              fs.writeFile(path.join( htmlpath, (+new Date())+'.html') , html);
            }
          });
        },
        assertAlert: function( expected, msg, tap ){
          return this.then(function(){
            return browser.alertText();
          }).then(function(text){
            assert.equal('assertAlert', text, expected, msg, tap );
            return browser.acceptAlert();
          }).then(function(){});
        },
        assertAttribute: function( target, expected, tap ){
          var sets = target.split("@"),
              attr = sets[1];

          target = sets[0];
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute(attr);
          }).then(function(value){
            assert.equal('assertAttribute', value, expected, '['+target+']', tap );
          });
        },
        assertEditable: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute('disabled');
          }).then(function(value){
            assert.ok('assertEditable', !value, '['+target+']'+msg, tap );
          });
        },
        assertNotEditable: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute('disabled');
          }).then(function(value){
            assert.ok('assertNotEditable', value, '['+target+']'+msg, tap );
          });
        },
        assertElementPresent: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            assert.ok('assertElementPresent', el, '['+target+']'+msg, tap );
          });
        },
        assertElementNotPresent: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            assert.ok('assertElementPresent', !el, '['+target+']'+msg, tap );
          });
        },
        assertLocation: function( expected, msg, tap ){
          return this.then(function(){
            return browser.execute('window.location.href');
          }).then(function( href ){
            assert.equal('assertLocation', href, expected, msg, tap );
          });
        },
        assertText: function( target, expected, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.text();
          }).then(function(text){
            assert.equal('assertText', text, expected, '['+target+']', tap );
          });
        },
        assertTextPresent: function( expected, msg, tap ){
          return this.then(function(){
            return browser.textPresent( expected, 'body' );
          }).then(function( isPresented ){
            assert.ok('assertTextPresent', isPresented, '['+expected+']'+msg, tap );
          });
        },
        assertTextNotPresent: function( expected, msg, tap ){
          return this.then(function(){
            return browser.textPresent( expected, 'body' );
          }).then(function( isPresented ){
            assert.ok('assertTextPresent', !isPresented, '['+expected+']'+msg, tap );
          });
        },
        assertTitle: function( expected, msg, tap){
          return this.then(function(){
            return browser.title();
          }).then(function(title){
            assert.equal( 'assertTitle', title, expected, msg, tap );
          });
        },
        assertValue: function( target, expected, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getValue();
          }).then(function(value){
            assert.equal('assertValue', value, expected, '['+target+']', tap );
          });
        },
        captureEntirePageScreenshot: function(filename, options, tap){
          return this.then(function(){
            return browser.takeScreenshot();
          }).then(function(screenshot){
            filename = util.restore(filename);
            grunt.log.writeln('      captureEntirePageScreenshot['+filename+']');
            fs.writeFile(filename, new Buffer( screenshot, 'base64').toString('binary'), 'binary');
          });
        },
        captureEntirePageScreenshotAndWait: function(filename, options, tap){
          return this.then(function(){
            return browser.takeScreenshot();
          }).then(function(screenshot){
            filename = util.restore(filename);
            grunt.log.writeln('      captureEntirePageScreenshot['+filename+']');
            fs.writeFile(filename, new Buffer( screenshot, 'base64').toString('binary'), 'binary');
          });
        },
        click: function( target ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            grunt.log.writeln('      click['+target+']');
            return browser.clickElement(el);
          }).then(function(){});
        },
        clickAndWait: function( target ){
          var token = 'wd_'+(+new Date())+'_'+(''+Math.random()).replace('.','');
          return this.then(function(){
            return browser.safeEval('window.'+token+'=true;');
          }).then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            grunt.log.writeln('      clickAndWait['+target+']');
            return browser.clickElement(el);
          }).then(function(){
            return browser.waitForCondition('!window.'+token, timeout);
          }).then(function(){});
        },
        storeCookieByName: function(cookieName, name){
          return this.then(function(){
            return browser.allCookie();
          }).then(function(cookies){
            var cookie = _(cookies).where({name:name}) || {};
            storedVars[name] = cookie.value;
            grunt.log.writeln('      storeCookieByName['+cookieName+', '+name+']');
          });
        },
        createCookie: function( pair, options ){
          var map = {},
              keyset = pair.split("=");

          map[keyset[0]] = keyset[1];
          return this.then(function(){
            grunt.log.writeln('      createCookie['+pair+', '+options+']');            
            return browser.setCookie(map, options);
          }).then(function(){});
        },
        deleteCookie: function( name ){
          return this.then(function(){
            grunt.log.writeln('      deleteCookie['+name+']');            
            return browser.deleteCookie(name);
          }).then(function(){});
        },
        echo: function( value ){
          grunt.log.writeln('      echo['+ util.restore(value)+']');
          return this;
        },
        goBack: function(){
          return this.then(function(){
          grunt.log.writeln('      goBack');
            return browser.back();
          }).then(function(){});
        },
        goBackAndWait: function(){
          return this.then(function(){
          grunt.log.writeln('      goBackAndWait');
            return browser.back();
          }).then(function(){});
        },
        select: function(target, options, tap){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return browser.clickElement(el);
          }).then(function(el){
            var sets = options.split("="),
                type = sets[0],
                value = sets[1];

            return el.element('css', 'option'+{
              'label': ':contains('+value+')',
              'value': '[value='+value+']',
              'index': ':eq('+value+')'
            }[type]||':contains('+value+')');
          }).then(function(el){
            grunt.log.writeln('      select['+target+', '+options+']');
            return browser.clickElement(el);
          }).then(function(){});
        },
        store: function( value , name ){
          storedVars[name] = util.restore(value);
          grunt.log.writeln('      store['+value+', '+name+']');
          return this;
        },
        storeElementPresent: function( target, name ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            storedVars[name] = el ? true : false;
            grunt.log.writeln('      storeElementPresent['+target+', '+name+']');
          });
        },
        storeEval: function( script, name ){
          return this.then(function(){
            return browser.safeExecute( script );
          }).then(function( result ){
            grunt.log.writeln('      storeEval['+script+'] result['+result+']');
            storedVars[name] = result;
          });
        },
        storeText: function( target, name ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.text();
          }).then(function(text){
            grunt.log.writeln('      storeText['+target+'] result['+name+']');
            storedVars[name] = text;
          });
        },
        type: function( target, keys ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function( el ){
            grunt.log.writeln('      type['+target+', '+keys+']');
            return browser.type(el, keys);
          }).then(function(){});
        },
        refreshAndWait: function( target ){
          var token = 'wd_'+(+new Date())+'_'+(''+Math.random()).replace('.','');
          return this.then(function(){
            grunt.log.writeln('      refreshAndWait['+target+']');
            return browser.safeEval('window.'+token+'=true;');
          }).then(function(){
            return browser.refresh();
          }).then(function(){
            return browser.waitForCondition('!window.'+token, timeout);
          }).then(function(){});
        },
        verifyAttribute: function( target, expected, tap ){
          var sets = target.split("@"),
              attr = sets[1];

          target = sets[0];
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute(attr);
          }).then(function(value){
            assert.equal('verifyAttribute', value, expected, '['+target+']', tap );
          });
        },
        verifyEditable: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute('disabled');
          }).then(function(value){
            assert.ok('verifyEditable', !value, '['+target+']'+msg, tap );
          });
        },
        verifyNotEditable: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getAttribute('disabled');
          }).then(function(value){
            assert.ok('verifyNotEditable', value, '['+target+']'+msg, tap );
          });
        },
        verifyElementPresent: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            assert.ok('verifyElementPresent', el, '['+target+']'+msg, tap );
          });
        },
        verifyElementNotPresent: function( target, msg, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            assert.ok('verifyElementPresent', !el, '['+target+']'+msg, tap );
          });
        },
        verifyLocation: function( expected, msg, tap ){
          return this.then(function(){
            return browser.execute('window.location.href');
          }).then(function( href ){
            assert.equal('verifyLocation', href, expected, msg, tap );
          });
        },
        verifyText: function( target, expected, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.text();
          }).then(function(text){
            assert.equal('verifyText', text, expected, '['+target+']', tap );
          });
        },
        verifyTextPresent: function( expected, msg, tap ){
          return this.then(function(){
            return browser.textPresent( expected, 'body' );
          }).then(function( isPresented ){
            assert.ok('verifyTextPresent', isPresented, '['+expected+']'+msg, tap );
          });
        },
        verifyTextNotPresent: function( expected, msg, tap ){
          return this.then(function(){
            return browser.textPresent( expected, 'body' );
          }).then(function( isPresented ){
            assert.ok('verifyTextPresent', !isPresented, '['+expected+']'+msg, tap );
          });
        },
        verifyTitle: function( expected, msg, tap){
          return this.then(function(){
            return browser.title();
          }).then(function(title){
            assert.equal( 'verifyTitle', title, expected, msg, tap );
          });
        },
        verifyValue: function( target, expected, tap ){
          return this.then(function(){
            return util.elementBy(target);
          }).then(function(el){
            return el.getValue();
          }).then(function(value){
            assert.equal('verifyValue', value, expected, '['+target+']', tap );
          });
        },
        waitForElementPresent: function(target){
          return this.then(function(){
            return util.waitForElement(target);
          }).then(function(){});
        },
        waitForVisible: function(target){
          return this.then(function(){
            return util.waitForVisible(target);
          }).then(function(){});
        },
        waitForNotVisible: function(target){
          return this.then(function(){
            return util.waitForNotVisible(target);
          }).then(function(){});
        }
      },
      key,
      supportedCmds = [];

  for(key in cmd){
    supportedCmds.push(key);
  }
  
  grunt.registerMultiTask('selenium', 'Run selenium', function( data ) {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
          browsers: ['firefox'],
          timeout: 10000
        }),
        done = this.async(),
        child,
        that = this;

    grunt.log.debug(supportedCmds.join('\n'));
    grunt.log.debug('Setup Selenium Server...');
    child = spawn('java -jar ' + seleniumjar + ( process.platform !== 'win32' ? '' : 
                                                 process.config.variables.host_arch === 'x64' ? ' -Dwebdriver.ie.driver='+ iedriver64 :
                                                                                                ' -Dwebdriver.ie.driver='+ iedriver86 ));

    child.stderr.on('data', function(data){
      grunt.log.debug(''+data);
    });

    child.stdout.on('data', function(data){
      data = (''+data).replace(/\n$/,'');
      grunt.log.debug(data);
      if( !data.match('Started org.openqa.jetty.jetty.Server') ) {
        return;
      }
      var wd = require('wd'),
          promise;

      that.files.forEach(function(f) {
        var suites = f.src.filter(function(filepath) {
              if (!grunt.file.exists(filepath)) {
                grunt.log.warn('Source file "' + filepath + '" not found.');
                return false;
              } else {
                return true;
              }
            }),
            tap = {
              data:['TAP version 13'],
              name: "",
              index:1,
              pass: 0,
              fail: 0
            };

        async.mapSeries( options.browsers, function(browserName, callback){
          tap.name = browserName;
          grunt.log.writeln('Setup browser ['+browserName+']');
          browser = wd.promiseRemote();
          promise = browser.init({
            browserName: browserName,
            name: 'This is an example test'
          });
          timeout = options.timeout;
          htmlpath = options.source;

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
                            command = $tr.find('td:eq(0)').text(),
                            target = $tr.find('td:eq(1)').text(),
                            value = $tr.find('td:eq(2)').text();
                        promise = ( 
                          cmd[command]||
                          function( target, value ){
                            grunt.log.warn('Command not supported['+command+']');
                            return this;
                          }
                        ).apply( promise, [ target, value, tap ] );
                      });
                      promise = promise.then(function(){
                        grunt.log.writeln('    Finish  test case['+testcase+']');
                        callback(promise);
                      });
                    }
                  });
                }, function( err, results ){
                  promise = promise.then(function(){
                    storedVars = {};
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
        }, function(){
          tap.data.push('');
          tap.data.push('1..'+(tap.pass + tap.fail));
          tap.data.push('# tests '+(tap.pass + tap.fail));
          tap.data.push('# pass '+ tap.pass);
          tap.data.push('# fail '+ tap.fail);
          grunt.file.write(f.dest, tap.data.join('\n'));      
          child.kill();
          done(options.force || isSuccess);
        });
      });
    });
  });
};
