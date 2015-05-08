snips
=====

A portable, plain-text, file-based syntax for your code snippets. No more being tied to some random snippet app and its xml or sqlite storage. As well, to create an easy means of exporting your snippets to a format that other applications (such as Dash, or SublimeText) can understand.

Inspired by [AMDSnippets](https://github.com/pierceray/AMDsnippets/) by [@pierceray](https://github.com/pierceray/).

For a technical explanation of this project, see [TECH.md](TECH.md)

# Prerequisites

```bash
brew install node
```

# Usage

```bash
npm install -g snips
snip init
snip export --help
# To see a list of all commands, run
snip --help
```

snips currently supports the following apps:

- Dash
- SublimeText3
- PHPStorm (tested with version 6.0.3)

If you have a request for other export formats, [please submit them](https://github.com/lzilioli/snips/issues).

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
---
```


| Key | Description |
| ----- | ------ |
| tags | Array of tags associated with the snippet. (not all exporters will use this value) |
| language | The language that the snippet is written in. |

*Note:* Currently, the text-mate exporter does not take the language or the tags into account.

### Namespace your snippet's names

As [recommended by Dash](http://kapeli.com/guide/guide.html#snippetTips), you might want to include a special 'trigger character' in your snippet names. By default, your snippets will be exported with a ` character at the end of their file's basename.

i.e. a file named comment.snippet would be registered as <code>comment`</code>

To change this behavior, see `snip config --help` or just run `snip config -e`.

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
---
define( [
    'flight/lib/component'
], function (
    component
) {

    {{!You can escape handlebars brackets to create hbs snippets eg:}}
    \{{This will show up in the template (without the leading \)}}
    {{!This will not.}}
    \{{!But this will.}}

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

# To Do List

TODO Create a cheat sheet exporter
