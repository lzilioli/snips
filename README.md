snippets
=====

Inspired by [AMDSnippets](https://github.com/pierceray/AMDsnippets/) by [@pierceray](https://github.com/pierceray/).

# Goal

To create a universal snippet format with an easy way of porting the snippets to various formats for various snippet apps (such as Dash, TextMate, etc.).

# Snippet Format

Snippets are simply handlebars templates that contain yaml front matter that call a specialized set of helper functions.

## Sample Snippet

Below is a sample snippet for an AMD-style module that returns a new Twitter flight component.

```
---
tags:
- 'javascript'
- 'amd'
- 'module'
- 'flightjs'
language: 'JavaScript'
abbreviation: amdflight
---
define( [
    'flight/lib/component'
], function (
    component
) {
    return component( {{{v "functionNameUI" }}} );

    function {{{v "functionNameUI" }}}() {

        this.attributes( {
        } );

        this.{{{v "startFn" }}} = function(){
        };

        this.after( 'initialize', function () {
            {{{ cursor }}}

            this.{{{v "startFn" }}}();
        } );
    }

} );
```

## Available Helpers

These are regular handlebars helpers that you can use in your templates. You can call them with either `{{ double bracket syntax }}` or `{{{ triple bracket syntax }}}`

| Helper name | Description | Arguments | Example |
| ----------- | ----------- | --------- | ------- |
| `v` | Use to name a variable in your snippet | `name` for variable | `{{{v "variableName"}}}` |
| `cursor` | Some snippet apps provide a means to place the cursor once the snippet has been placed in the editor. Call this helper to output the proper syntax to indicate the cursor's position. | none | `{{{ cursor }}}` |

# Setup

```bash
git clone https://github.com/lzilioli/portable-snippets.git
cd portable-snippets
brew install npm
npm install -g grunt-cli
npm install
grunt hooks
```

(most folks will only need the last two lines)

If you have additional sets of snippets that you want included in your built snippet library, but do not want to commit them to the repo, you can do so one of two ways:

1. Add them to `grunt/config/vars/` in the `paths.snippets` object, or
2. The repo's .gitignore file explicitly excludes any file whose name ends with `_ignore`. If you put a directory full of snippets in `snippets/` with `_ignore` at the end of its name, the snippets won't be included in the repository, but will still be included when exporting snippets to your app of choice/

# Exporting/Consuming Snippets

Exporting snippets happens by way of grunt tasks. One should implement a grunt multi-task for exporting snippets to a given format. The app to which you wish to export templates must be supported.

## Supported Apps

- [Dash](http://kapeli.com/dash) - `grunt dash`
- [Sublime-Style Snippets](https://github.com/pierceray/AMDsnippets) - `grunt text-mate`

Note that support for TextMate style snippets could be added by adding an additional entry in `grunt/config/text-mate.js` with `outputExtension: '.text-mate'` (or whatever extension TextMate expects).

For either of the below tasks, once the export has completed, you can point your relevant app to the exported snippet library.

TODO: Right now, theres a lot of duplicated code between the translators and the tasks responsible for outputting the snippet library for the given app. Both of these components should inherit from a base module that does a lot of the redundant work.

## `grunt dash`

Reads in all of the snippet files specified at `grunt.config.vars.paths.snippets`, and exports them to a SQLite3 database compatible with Dash.

### Arguments

```javascript
main: {
    options: {
        // See the below What's Going on Here section for an explanation
        // of the translator
        translator: global.req( 'dash-translator' )({
            // Optional config varDelimiter, should correspond
            // to the setting in dash preferences (defaults to __)
            // (this is true only of the dash-translator, note that the
            // text-mate translator does not require an invocation
            // prior to exposing the translator API.
            varDelimiter: '__'
        }),
        // Where to get the snippets
        snippetSource: '<%= vars.paths.snippets %>',
        // Where to put the dash SQLite DB
        exportFile: 'export/Snippets.dash',
        // Will prefix your snippets abbreviations as recommended
        // in the dash docs http://kapeli.com/guide/guide.html#snippetTips
        abbreviationPrefix: '`'
    }
}
```

[dash snippet reference](http://kapeli.com/guide/guide.html#introductionToSnippets)

## `grunt text-mate`

Reads in all of the snippet files specified at `grunt.config.vars.paths.snippets`, and exports them to a directory using syntax that is compatible with TextMate snippets.

### Arguments

```javascript
main: {
    options: {
        // See the below What's Going on Here section for an explanation
        // of the translator
        translator: global.req( 'text-mate-translator' ),
        // Where to get the snippets
        snippetSource: '<%= vars.paths.snippets %>',
        // Where to put the snippets (directory structure from their source
        // will be preserved)
        snippetDest: 'export/AMDsnippets/',
        // Extension for each exported snippet within snippetDest
        outputExtension: '.sublime-snippet'
    }
}
```

# What's Going on Here

Each grunt task that performs snippet exporting is expected to follow roughly the same format:

- Fetch the model for the snippets as specified in the task's options
- Use the model to generate output that is readable by the target snippet application

If you refer to the *Sample Snippet* and *Available Helpers* sections above, you will see that the snippets are written as handlebars templates that call a special set of helper functions. These functions are responsible for turning the snippet's contents into text that can be understood by the target snippet application.

This happens as a result of the `translator` that gets passed in the task's grunt config. When the model for the snippets is being generated by `lib/snippet-loader.js`, the contents of each snippet will be passed through the translator. Be sure that you implement all helpers that are being used by your snippet library. For sanity, let's try and stick to the blessed list of helpers in the above *Available Helpers* section.

Here is a sample translator for the text-mate task.

```javascript
var _ = require( 'underscore' );

module.exports = ( function() {

    var handlebars = require( 'handlebars' );

    // Used to track internal state across calls to the v helper
    var curTabIndex = 1;
    var tabIndices = {};

    var helpers = {
        // This should return text that the app's snippet engine
        // would recognize as a variable.
        v: function( variableName ) {
            if ( !tabIndices[ variableName ] ) {
                tabIndices[ variableName ] = curTabIndex++;
            }
            var varTabIdx = tabIndices[ variableName ];
            return '${' + varTabIdx + ':' + variableName + '}';
        },
        // This should return text that the app's snippet engine
        // would recognize as the location for your cursor once
        // the snippet has been placed. (not all apps support this)
        cursor: function() {
            return '';
        }
    };

    // Public API
    return {
        // This function will receive an argument with a 'contents' property.
        // It should return the contents such that the target snippet
        // application would understand the contents of if the snippet's body.
        translate: function( opts ) {
            handlebars.helpers = helpers;
            return handlebars.compile( opts.contents )();
        },
        // This will get called by `lib/snippet-loader.js` in between
        // processing snippets. This way, you can manage any internal state you
        // need while performing the translation.
        snipTeardown: function() {
            curTabIndex = 1;
            tabIndices = {};
        }
    };
}() );

```



# Upgrading your snippets

```bash
update_snippets() {
    pushd ~/Projects/portable-snippets/ &&
    git pull &&
    grunt dash &&
    popd
}
```
