module.exports = {
	js: [ '<%= vars.paths.js %>' ],
	options: {
		jshintrc: '.jshintrc',
		reporter: require( 'jshint-stylish' )
	}
};
