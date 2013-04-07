'use strict';

var grunt = require('grunt');

function getNormalizedFile(filepath) {
  return grunt.util.normalizelf(grunt.file.read(filepath));
}
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.selenium = {
  success: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('test/actual/success.tap');
    var expected = getNormalizedFile('test/expected/success.tap');
    test.equal(actual, expected, 'should output tap of success case.');

    test.done();
  },
  fail : function(test){
    test.expect(1);

    var actual = getNormalizedFile('test/actual/failed.tap');
    var expected = getNormalizedFile('test/expected/failed.tap');
    test.equal(actual, expected, 'should output tap of failed case.');

    test.done();
  }
};
