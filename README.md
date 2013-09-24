# Grunt Selenium
[![Build Status](https://travis-ci.org/sideroad/grunt-selenium.png?branch=master)](https://travis-ci.org/sideroad/grunt-selenium)
> Execute WebDriver using HTML suite file which is Selenium IDE general formatted.
- Selenium IDE can debug easily more than WebDriver.
- WebDriver can test on browsers not only Firefox and detect browser depended bugs.

## Specification
- Execute WebDriver using HTML multiple suite files
- Enclose IEDriver, ChromeDriver
- Save HTML source when `open` command executed.

## Getting Started

### Install Grunt
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-selenium --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-selenium');
```

### Install node-gyp, when you use Windows
See below and install `node-gyp`
https://github.com/TooTallNate/node-gyp#installation

### Prepare for using IE, when you use Windows
  + Open `Internet options` on IE
  + Check `Safe mode` on all site type

## The "selenium" task

### Overview
In your project's Gruntfile, add a section named `selenium` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  selenium: {
    options: {
      browsers: ['firefox','ie','chrome']
    },
    suite: {
      files: {
        'example.tap': ['test/source/**/*.suite']
      }
    }
  }
})
```

### Files property
-  src
 HTML test suite file path or HTML test case file path.
-  dist
 TAP file path

### Options

#### options.startURL
Type: `String`
Default value: `undefined`

Execute selenium with this URL.

#### options.browsers
Type: `Array`
Default value: `[ 'firefox' ]`

Array value that is used to testing browsers.

#### options.timeout
Type: `Number`
Default value: `10000`

Command timeout.

#### options.source
Type: `String`
Default value: `undefined`

The path to save html source, when execute open command.

## Supported Selenium IDE commands
  - assertAlert
  - assertAttribute
  - assertEditable
  - assertNotEditable
  - assertElementPresent
  - assertElementNotPresent
  - assertEval
  - assertExpression
  - assertLocation
  - assertText
  - assertTextPresent
  - assertTextNotPresent
  - assertTitle
  - assertValue
  - captureEntirePageScreenshot
  - captureEntirePageScreenshotAndWait
  - click
  - clickAndWait
  - storeCookieByName
  - createCookie
  - deleteCookie
  - echo
  - fireEvent
  - getEval
  - goBack
  - goBackAndWait
  - select
  - selectFrame
  - sendKeys
  - store
  - storeElementPresent
  - storeEval
  - storeText
  - type
  - refreshAndWait
  - verifyAttribute
  - verifyEditable
  - verifyNotEditable
  - verifyElementPresent
  - verifyElementNotPresent
  - verifyLocation
  - verifyText
  - verifyTextPresent
  - verifyTextNotPresent
  - verifyTitle
  - verifyValue
  - waitForElementPresent
  - waitForVisible
  - waitForElementNotPresent
  - waitForNotVisible

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

