var Q = require( 'Q' );
var fs = require( 'fs' );
var util = require( 'util' );
var path = require( 'path' );
var _ = require( 'underscore' );
var mkpath = require( 'mkpath' );
var sqlite3 = require( 'sqlite3' ).verbose();
var snips = require( '../snips' );
var Exporter = snips.proto.Exporter;

module.exports = exports = DashExporter;
util.inherits( DashExporter, Exporter );

function DashExporter() {
	this.name = 'Dash';
	var dashTranslator = require( '../translators/dash' );
	this.translator = new dashTranslator();
	this.snippetDest = path.join( snips.exportDir, '/Snippets.dash' );
	Exporter.call( this );
}

DashExporter.prototype.export = function() {

	var myself = this;

	var deferred = Q.defer();

	// Get an instance of the DB
	var db = getDb( myself.snippetDest );

	// Insert the things
	db.serialize( function() {
		_.each( myself.snippetData.data.tags, function( tag ) {
			insertTag( db, tag );
		} );
		_.each( myself.snippetData.data.snippets, function( snippet ) {
			insertSnippet( db, snippet );
			_.each( snippet.tags, function( tag ) {
				insertSnippetTagPair( db, snippet.__id, myself.snippetData.getTagId( tag ) );
			} );
		} );
	} );

	// Close the DB
	db.close( function() {
		deferred.resolve( true );
	} );

	return deferred.promise;
};

DashExporter.prototype.afterExport = function() {
	snips.logger.user( [
		'To import them into Dash, run the following command:\n'.blue,
		'$'.grey, ( 'open ' + this.snippetDest ).blue
	].join( ' ' ) );
};

/******************************************************************************
 *****     HELPERS    *********************************************************
 ******************************************************************************/

/**
 * Given a desired path to a sqLite DB, return a DB object pointing to a DB at
 * that path.
 *
 * @param  {String} DBPath		Relative path (from project root) at which
 *								to create the DB.
 * @return {Object}				sqlite3.Database object for a new DB at DBPath
 */
function getDb( dbPath ) {
	// Determine if it was already there
	var dbExisted = fs.existsSync( dbPath );
	// Make sure directories up to the DB exist (like mkdir -p)
	mkpath.sync( path.dirname( dbPath ) );
	// Instantiate the DB
	var db = new sqlite3.Database( dbPath );
	// Create the tables
	db.serialize( function() {
		// If it existed, drop its tables before recreating them
		if ( dbExisted ) {
			db.run( 'DROP TABLE smartTags' );
			db.run( 'DROP TABLE snippets' );
			db.run( 'DROP TABLE tags' );
			db.run( 'DROP TABLE tagsIndex' );
		}
		// Create the tables
		db.run( 'CREATE TABLE smartTags(stid INTEGER PRIMARY KEY, name TEXT, query TEXT)' );
		db.run( 'CREATE TABLE snippets(sid INTEGER PRIMARY KEY, title TEXT, body TEXT, syntax VARCHAR(20), usageCount INTEGER, FOREIGN KEY(sid) REFERENCES tagsIndex(sid) ON DELETE CASCADE ON UPDATE CASCADE)' );
		db.run( 'CREATE TABLE tags(tid INTEGER PRIMARY KEY, tag TEXT UNIQUE, FOREIGN KEY(tid) REFERENCES tagsIndex(tid) ON DELETE CASCADE ON UPDATE CASCADE)' );
		db.run( 'CREATE TABLE tagsIndex(tid INTEGER, sid INTEGER)' );
	} );
	return db;
}

function insertSnippet( db, snippet ) {
	var stmt = db.prepare( 'INSERT INTO `snippets` VALUES(?, ?, ?, ?, ?)' );
	stmt.run( snippet.__id, snippet.__abbreviation, snippet.__content, snippet.language, 0 );
	stmt.finalize();
}

function insertTag( db, tag ) {
	var stmt = db.prepare( 'INSERT INTO `tags` VALUES(?, ?);' );
	stmt.run( tag.__id, tag.name );
	stmt.finalize();
}

function insertSnippetTagPair( db, snippetId, tagId ) {
	var stmt = db.prepare( 'INSERT INTO `tagsIndex` VALUES(?, ?);' );
	stmt.run( tagId, snippetId );
	stmt.finalize();
}
