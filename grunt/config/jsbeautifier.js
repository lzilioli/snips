module.exports = function() {
	var jsBeautifierOpts = {
		'indentWithTabs': true,
		'preserveNewlines': true,
		//'max_preserve_newlines': 4,
		'spaceInParen': true,
		//'jslint_happy': true,
		'braceStyle': 'collapse',
		'keepArrayIndentation': false,
		'keepFunctionIndentation': false,
		'evalCode': false,
		'unescapeStrings': false,
		'breakChainedMethods': false,
		'e4x': false,
		'wrapLineLength': 0,
	};

	return {
		main: {
			src: [ '<%= vars.paths.js %>' ],
			options: {
				js: jsBeautifierOpts
			}
		},
		lint: {
			src: [ '<%= vars.paths.js %>' ],
			options: {
				mode: 'VERIFY_ONLY',
				js: jsBeautifierOpts
			}
		}
	};
};
