require( './lib/globalConfig' );
var path = require( 'path' );

module.exports = function( grunt ) {

	require( 'load-grunt-config' )( grunt, {
		//path to task.js files, defaults to grunt dir
		configPath: path.join( process.cwd(), 'grunt/config' ),
		//can post process config object before it gets passed to grunt
		postProcess: function( /*config*/) {}
	} );

	grunt.loadTasks( 'grunt/tasks' );

};
