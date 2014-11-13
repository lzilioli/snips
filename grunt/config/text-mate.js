module.exports = function() {
	return {
		sublime: {
			options: {
				translator: global.req( 'text-mate-translator' ),
				snippetSource: '<%= vars.paths.snippets %>',
				snippetDest: 'export/SublimeSnippets/',
				outputExtension: '.sublime-snippet'
			}
		}
	};
};
