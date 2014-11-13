portable-snippets
=================

**Goal**

To create a portable, plain-text, file-based syntax for your code snippets. No more being tied to some random snippet app and its xml or sqlite storage. As well, to create an easy means of exporting your snippets to a format that other applications (such as Dash, or SublimeText) can understand.

Inspired by [AMDSnippets](https://github.com/pierceray/AMDsnippets/) by [@pierceray](https://github.com/pierceray/).

# Brief Technical Overview

This project is comprised of 4 components:

| Component | Description |
| --------- | ----------- |
| [snippets](#snippets) | A portable, plain-text, file-based syntax for your code snippets. No more being tied to some random snippet app and its xml or sqlite storage. |
| [exporters](#exporters) | Grunt multi-tasks that interact with the snippet-loader in order to export your templates to a format for a target application. |
| snippet-loader | A JS module that is responsible for reading your template files and returning a model representing them for export. (this is used internally by exporters) |
| translators | A JS module that is responsible for converting the portable-snippets format into a format that the target application can understand. Translators usually have a 1:1 mapping with exporters. |

For an in-depth technical overview, see [Technical Deep Dive](#technical-deep-dive)

# Snippets

Snippets are simply handlebars templates that call a specialized set of helper functions (they can also contain yaml front matter).

## YAML-Front

You can include (optional) yaml-front matter at the beginning of your snippets.

### Sample

```javascript
---
tags:
- 'javascript'
- 'amd'
- 'module'
- 'flightjs'
language: 'JavaScript'
abbreviation: amdflight
abbreviationPrefix: ''
---
```


| Key | Description |
| ----- | ------ |
| tags | Array of tags associated with the snippet. (not all exporters will use this value) |
| language | The language that the snippet is written in. |
| abbreviation | The name for the snippet, if none is specified, the filename will be used. |
| abbreviationPrefix | This will override the abbreviationPrefix passed to the exporter. |

*Note:* Currently, the text-mate exporter does not take the language or the tags into account.

TODO: Fix tags bug for dash, tags are being mismatched

### abbreviationPrefix

As [recommended by Dash](http://kapeli.com/dash_guide#snippetTips), you might want to prefix your snippet names. portable-snippets will determine the prefix to use for your snippet name as follows:

- If defined, use the one in the snippet's yaml-front
- Else, if defined, use the one defined in the snippet's parent directory's `dir.abbreviationPrefix` file
- Else, use the one passed as an argument to the task
- If none of those are defined, use nothing

## Helpers

There are a couple of helper functions (these are regular [handlebars helper functions](http://handlebarsjs.com/#helpers)) available to you within the snippet's body. You can call them with either `{{ double bracket syntax }}` or `{{{ triple bracket syntax }}}` ([here's](http://handlebarsjs.com/#html-escaping) the difference). These helpers are used by exporters when they are converting the snippet's body into something the target application can understand. They are the key to making the snippets portable between formats.

| Helper name | Description | Arguments | Example |
| ----------- | ----------- | --------- | ------- |
| `v` | Use to name a variable in your snippet | `name` for variable | `{{{v "variableName"}}}` |
| `cursor` | Some snippet apps provide a means to place the cursor once the snippet has been placed in the editor. Call this helper to output the proper syntax to indicate the cursor's position. | none | `{{{ cursor }}}` |

## Sample Snippet

Below is a sample snippet for an AMD-style module that returns a new Twitter flight component.

```javascript
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

# Setup

```bash
# Clone the repo
git clone https://github.com/lzilioli/portable-snippets.git
# Go into the directory
cd portable-snippets
# You only need the next 2 commands if you dont the stuff installed
brew install npm
npm install -g grunt-cli
# Install project dependancies locally
npm install
# Install git hooks to support development
grunt hooks

# Last Step
# #########

# Copy the `snippets-sample/` directory to `snippets/`
mkdir snippets
cp -r snippets-sample/ snippets/sample
# --- OR ---
mkdir snippets
cd snippets
git clone <snippet repo url>
```

**The last step is crucial to getting the export step to work.** The snippets directory is the source of snippets for the export tasks.

If you choose to clone a snippet repo, I've got one [here](https://github.com/lzilioli/my-snippets), but I highly suggest you make your own (feel free to fork mine).

This snippets directory is your own. Anything in that directory and it's subfolders with a `.snippet` extension will be included when exporting snippets. It's .gitignored, so feel free to do anything you'd like with it, including pulling in additional repos.

If you're developing in the repo, the default grunt task will watch some files and do some stuff for you (lint, beautify, etc.). Use the watch task, use the hooks. Don't push busted code.

# Exporting Your Snippets

Exporting snippets happens by way of grunt tasks. This project currently supports exporting your snippets to two formats:

- [Dash](http://kapeli.com/dash) - `grunt dash`
- [Sublime-Style Snippets](https://github.com/pierceray/AMDsnippets) - `grunt text-mate`
    - Note that support for TextMate style snippets could be added by adding an additional entry in `grunt/config/text-mate.js` with `outputExtension: '.text-mate'` (or whatever extension TextMate expects).

For either of the below tasks, once the export has completed, you can point your relevant app to the exported snippet library (in the .gitignored `export/` directory), or symlink the exported directory as appropriate.

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
        // Will prefix your snippets abbreviations as recommended
        // in the dash docs http://kapeli.com/guide/guide.html#snippetTips
        abbreviationPrefix: '`'
    }
}
```

[dash snippet reference](http://kapeli.com/guide/guide.html#introductionToSnippets)

### `grunt text-mate`

Reads in all of the snippet files within the `snippets` directory, and exports them to a directory using syntax that is compatible with TextMate snippets.

The [AMDSnippets repo](https://github.com/pierceray/AMDsnippets/) has a good step-by-step on how to install AMDSnippets for SublimeText.

**For ST3:**

```bash
cd ~/Library/"Application Support"/"Sublime Text 3"/Packages/
ln -s /path/to/repo/export/SublimeSnippets ./snippets
```

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
        snippetDest: 'export/AMDsnippets/',
        // Extension for each exported snippet within snippetDest
        outputExtension: '.sublime-snippet'
    }
}
```

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
        // abbreviation and description come from the snippetData
        '<tabTrigger>{{ abbreviation }}</tabTrigger>',
        '<description>{{ description }}</description>',
        // The translate function registers the ___scope helper (currently unused, commenting out)
        // '<scope>{{ ___scope }}</scope>',
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
            // Commented out until we support this
            // handlebars.registerHelper( '___scope', function() {
            //  return getScope( snippetData.language );
            // } );
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

# Upgrading your snippets

You may find it helpful to define the following alias (or something similar), to quickly re-export your snippets when you change the files in the `snippets` directory:

```bash
update_snippets() {
    # Go into the project directory
    pushd ~/Projects/portable-snippets/ &&
    # Do a fresh build of the snippets (this example is for dash)
    grunt clean dash &&
    # Go back to whatever folder I was in before this alias started running
    popd
}
```

# To Do List

TODO: Right now, theres a lot of duplicated code between the translators and the tasks responsible for outputting the snippet library for the given app. Both of these components should inherit from a base module that does a lot of the redundant work.

TODO: Take advantage of the global.config with overrides to allow customization of snippet extension, pattern, etc. (avoid .gitignoring grunt configs)

TODO: Enable partial support within the snippets directory.

TODO: Convert global features into its own module (or fold into lz-node-utils)

TODO: Create a cheat sheet exporter

TODO: How to make a snippet that desires {{ }} in the output?
