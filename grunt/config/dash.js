module.exports = function() {
	return {
		snippets: {
			options: {
				translator: global.req( 'dash-translator' )(),
				snippetSource: '<%= vars.paths.snippets %>',
				exportFile: 'export/Snippets.dash',
				abbreviationPrefix: '`'
			}
		}
	};
};
