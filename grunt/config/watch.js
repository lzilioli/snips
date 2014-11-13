module.exports = {
	js: {
		files: [ '<%= vars.paths.js %>' ],
		tasks: [ 'js_on_watch' ]
	},
	dev: {
		files: [ '<%= vars.paths.js %>', '<%= vars.paths.snippets %>' ],
		tasks: [ 'dev_on_watch' ]
	}
};
