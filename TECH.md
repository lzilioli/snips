NOTE This document is slightly out of date and needs to be updated.

# Brief Technical Overview

This project is comprised of 4 components:

| Component | Description |
| --------- | ----------- |
| [snippets](#snippets) | A portable, plain-text, file-based syntax for your code snippets. No more being tied to some random snippet app and its xml or sqlite storage. |
| [exporters](#exporters) | Grunt multi-tasks that interact with the snippet-loader in order to export your templates to a format for a target application. |
| snippet-loader | A JS module that is responsible for reading your template files and returning a model representing them for export. (this is used internally by exporters) |
| translators | A JS module that is responsible for converting the portable-snippets format into a format that the target application can understand. Translators usually have a 1:1 mapping with exporters. |

For an in-depth technical overview, see [Technical Deep Dive](#technical-deep-dive)

# Technical Deep Dive

## Exporters

Exporters are grunt tasks. Their expected configurations can be found above (this varies by exporter). Upon being run, `exporter` tasks use the `snippet-loader` module to get an in-memory model of the snippets in the snippets directory. It can iterate over this model to do its exporting (to see a sample exporter, look at `grunt/tasks/*-exporter.js`). Internally, the `exporter` exposes the `translator` to the `snippet-loader`. As the `snippet-loader` is loading the templates, it will call `translator.translate( snippetData )`. The return value should be a snippet body that the target export application can understand. If defined, `snippet-loader` will also call `translator.snipTeardown()` in-between snippets, so that the translator can do any necessary internal state management. The translator is responsible for loading handlebars, and defining the correct set of [handlebars helper functions](http://handlebarsjs.com/#helpers) such that the `translator.translate()` function returns the correct result (this function is also responsible for compiling and running the handlebars interpreter on the snippet's contents).

- I anticipate the set of available helpers within snippets to grow as the number of exporters grows.
- If creating new exporters or translators, please try and follow the naming convention `appName-translator.js` or `appName-exporter.js`.

Here is the translator for the text-mate class, with robust comments:

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
        // the snippet has been placed.
        cursor: function() {
            return '$0';
        }
    };

    var wrapperTmpl = [
        // The translate function registers the ___snippet helper
        '<snippet><content><![CDATA[{{{ ___snippet }}}]]></content>',
        // __abbreviation and description come from the snippetData
        '<tabTrigger>{{ __abbreviation }}</tabTrigger>',
        '<description>{{ description }}</description>',
        // Make them available in all contexts
        '<scope>source,text</scope>',
        '</snippet>'
    ].join( '\n' );

    // Public API
    return {
        // This function will receive an argument with a 'contents' property.
        // It should return the contents such that the target snippet
        // application would understand the contents of the snippet's body.
        translate: function( snippetData ) {
            // Register the static helpers defined above
            handlebars.helpers = helpers;
            // Get the snippet body
            var rendered = handlebars.compile( snippetData.__content )();
            // Register some helpers so we can handlebars the wrapperTmpl (defined above)
            handlebars.registerHelper( '___snippet', rendered );
            // handlebars-ify the wrapperTmpl using snippetData as model
            var fullSnippet = handlebars.compile( wrapperTmpl )( snippetData );

            return fullSnippet;
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

### Exporter Config Documentation

### `grunt dash`

Reads in all of the snippet files within the `snippets` directory, and exports them to a SQLite3 database compatible with Dash. Just [point Dash to the exported file](http://kapeli.com/dash_guide#managingSnippets).

**WARNING** Currently, this task will destroy and recreate your dash database. It is intended that you use your snippets directory as the source of truth for your snippets. Don't put any snippets directly into Dash.

#### Config

*Note:* Unless you are working on this tool itself, you likely will not need to worry about the config for this exporter.

```javascript
main: {
    options: {
        // See the below Implementing an Exporter section for an explanation
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
    }
}
```

[dash snippet reference](http://kapeli.com/guide/guide.html#introductionToSnippets)

### `grunt text-mate`

Reads in all of the snippet files within the `snippets` directory, and exports them to a directory using syntax that is compatible with TextMate snippets.

#### Config

*Note:* Unless you are working on this tool itself, you likely will not need to worry about the config for this exporter.

```javascript
main: {
    options: {
        // See the below Implementing an Exporter section for an explanation
        // of the translator
        translator: global.req( 'text-mate-translator' ),
        // Where to get the snippets
        snippetSource: '<%= vars.paths.snippets %>',
        // Where to put the snippets (directory structure from their source
        // will be preserved)
        snippetDest: 'export/SublimeSnippets/',
        // Extension for each exported snippet within snippetDest
        outputExtension: '.sublime-snippet'
    }
}
```
