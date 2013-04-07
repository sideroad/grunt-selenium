# Grunt Selenium

- Selenium IDE can debug easily more than WebDriver.
- WebDriver can test on browsers not only Firefox and detect browser depended bugs.
> This plugin run Selenium WebDriver using HTML Suite file which is Selenium IDE general formatted.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-selenium --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-selenium');
```

## The "selenium" task

### Overview
In your project's Gruntfile, add a section named `selenium` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  selenium: {
    options: {
      browsers: ['firefox']
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
Key  : TAP file path 
Value: suites file path.

### Options

#### options.startURL
Type: `String`
Default value: `undefined`

Execute selenium with this URL.

#### options.browsers
Type: `Array`
Default value: `[ 'firefox' ]`

Array value that is used to testing browsers.

## Supported commands
  - open
  - assertAlert
  - assertElementPresent
  - assertElementNotPresent
  - assertLocation
  - assertText
  - assertTextPresent
  - assertTextNotPresent
  - assertTitle
  - click
  - clickAndWait
  - deleteCookie
  - echo
  - goBack
  - goBackAndWait
  - store
  - storeElementPresent
  - storeEval
  - storeText
  - type
  - verifyElementPresent
  - verifyElementNotPresent
  - verifyText
  - verifyTextPresent
  - verifyTextNotPresent
  - verifyTitle
  - waitForElementPresent


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

