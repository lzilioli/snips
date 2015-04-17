module.exports = function( grunt ) {
	var config = require( 'shared-grunt-config' )( __dirname, grunt );
	config.addTodo( [ 'config/*.js' ] );
};
