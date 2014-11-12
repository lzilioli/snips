module.exports = {
	js: {
		files: [ '<%= vars.paths.js %>' ],
		tasks: [ 'js_on_watch' ]
	},
	snippets: {
		files: [ '<%= vars.paths.snippets %>' ],
		tasks: [ 'dash' ]
	}
};
