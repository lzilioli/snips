module.exports = {
	all: {
		files: [ '<%= vars.paths.js %>', '<%= vars.paths.snippets %>' ],
		tasks: [ 'watch_js', 'watch_snippets' ]
	},
	js: {
		files: [ '<%= vars.paths.js %>' ],
		tasks: [ 'watch_js' ]
	},
	snippets: {
		files: [ '<%= vars.paths.snippets %>' ],
		tasks: [ 'watch_snippets' ]
	}
};
