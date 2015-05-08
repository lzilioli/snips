NOTE This document is slightly out of date and needs to be updated.

# Brief Technical Overview

This project is comprised of 4 components:

| Component | Description |
| --------- | ----------- |
| snippets | A portable, plain-text, file-based syntax for your code snippets. No more being tied to some random snippet app and its xml or sqlite storage. |
| [snips.loader](#snips.loader) | A JS module that is responsible for reading your template files and returning a model representing them for export. (this is used internally by exporters) |
| [exporters](#exporters) | JS modules that are responsible for exporting the snippets for a particular application. |
| [translators](#translators) | A JS module that is responsible for converting snippets of the snips format into a format that the target application can understand. Translators usually have a 1:1 mapping with exporters. |

For an in-depth technical overview, see [Technical Deep Dive](#technical-deep-dive)

# Technical Deep Dive

## snips

In general, this module should be used to access most components contained within the snips codebase. It exposes a logger, the snippet loader, the program's arguments, a bridge to the cli commands implemented in `bin/` and many other useful things while working in the snips codebase.

### snips.loader

This module is responsible for loading in the snippets from the user's snippets directory. The result of calling load will be available in `this.snippetData` within exporters. That data is as follows:

```javascript
{ 
  data: {
    snippets: [ {
        tags: ['tags', 'for', 'snippet'],
        language: 'snippet language as specified in the YAML front matter',
        __content: 'Rendered snippet body as returned by the translator',
        __id: <snippet_id>,
        __filepath: 'fully/qualified/path/to/snippet/file',
        __abbreviation: 'name of snippet file with pre and postfixes',
      __variables: ['array of all variables defined within the snippet (  Determined by looking for invocations of the v handlebars helper.']
      }, { ... } ],
    tags: [ { __id: <tag_id>, name: 'tag name' }, { ... } ]
  },
  getTagId: function(name) { /* returns a tag id given its name */ }
}
```

## Exporters

Exporters are modules that should inherit from `lib/proto/exporter.js`. To implement a new exporter, look at some examples in `lib/exporters`.

Each exporter must define the following:

| Value | Description |
| ----- | ------ |
| translator | An instantiated translator. |
| name | A string that represents the name of the Exporter. |
| export | A function that performs the actual exporting of the snippets. |
| snippetDest | A string that represents where the snippets should be exported to. Should be relative to `snips.exportDir` |
| afterExport | A function that runs once exporting has completed. This function should use `snips.logger.user` to instruct the user on how to import the snippets into the applicable app. |

### export

The export function should access `this.snippetData` for purposes of accessing the available snippets. `this.snippetData` contains the result of calling `snippetLoader.load`.

## Translators

Translators are modules that should inherit from `lib/proto/translator.js`. To implement a new exporter, look at some examples in `lib/translators`.

Each translator must define the following:

| Value | Description |
| ----- | ------ |
| helpers | An object of helpers to be registered with Handlebars. This object must contain two helpers: `v` and `cursor`. |
| translate | A function that takes a snippet's data as loaded by `snips.loader` and returns the snippet formatted properly for the desired application. When this function is invoked, the argument's `__content` key will contain the snippet's body without the YAML front matter. The return value of this function will replace the `__content` key to be used later by the exporter. The translate function can access `this.handlebars`, which will be an instantiated handlebars instance with the translator's helpers already defined. |
| snipTeardown | An (optional) function that is invoked by the loader in between rendering snippets. This may be useful for a translator that needs to maintain state between rendering templates (see the Sublime translator for an example of this in use.) |
