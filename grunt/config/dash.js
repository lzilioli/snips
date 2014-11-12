module.exports = function() {
	return {
		main: {
			options: {
				snippetSource: '<%= vars.paths.snippets %>',
				exportFile: 'export/Snippets.dash',
				abbreviationPrefix: '`'
			}
		}
	};
};
