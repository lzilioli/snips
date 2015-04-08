'use strict';

var winston = require( 'winston' );
require( 'colors' );

var logger = new winston.Logger( {
	levels: {
		_nada: 64,
		user: 32,
		info: 16,
		dev: 8,
		dive: 4,
		warn: 2,
		error: 1
	},
	transports: [
		new( winston.transports.Console )( {
			level: 'user'
		} )
	]
} );

module.exports = exports = logger;
