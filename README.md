snippets
=====

Inspired by [AMDSnippets](https://github.com/pierceray/AMDsnippets) by @pierceray

[dash snippet reference](http://kapeli.com/guide/guide.html#introductionToSnippets)

TODO: Document its features and how to initialize
TODO: Gruntify
TODO: Export to multiple template formats (done via Gruntification?)
TODO: Specify external source, merge all together

```
snipup() {
    pushd ~/Projects/portable-snippets/ &&
    git pull &&
    node lib/main.js &&
    popd
}
```
