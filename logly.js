var fs = require( 'fs' );
var os = require( 'os' );

exports.version =
  JSON.parse( fs.readFileSync( __dirname + '/package.json' ) ).version;

var name = {};
var mode = {};

// because logly is a singleton, we save global settings as a hash
//  using process.pid as keys
name[ process.pid ] = 'logly';
mode[ process.pid ] = 'standard';

var get_time = function(){
  return (new Date).toJSON();
};

var HOST = os.hostname();

var format_message = function(mode, msg){
  return '[' + get_time() + ']@' + HOST + ' ' + mode  + ' ' + msg;
};

var logger = function( input, methodMode ) {
  if ( typeof( input ) === "string" ) {
    if ( methodMode == 'error' || methodMode == 'warn' ) {
      console.error(format_message(methodMode, input));
    } else if ( methodMode != 'standard' ) {
      console.log(format_message(methodMode, input));
    } else {
      console.log(format_message('info', input));
    }
  } else if ( typeof( input ) === "function" ) {
    input();
  }
};

var debug = function( input ) {
  if ( 'debug' == mode[ process.pid ] ) {
    logger( input, 'debug' );
  }
};

var log = function( input ) {
  if ( 'standard' == mode[ process.pid ] || 'verbose' == mode[ process.pid ] 
      || 'debug' == mode[ process.pid ] ) {
    logger( input, 'standard' );
  }
};

var error = function( input ) {
  logger( input, 'error' );
};

var stderr = function( input ) {
  if ( typeof( input ) === "string" ) {
    process.stderr.write( input );
  } else if ( typeof( input ) === "function" ) {
    input();
  }
};

var stdout = function( input ) {
  if ( typeof( input ) === "string" ) {
    process.stdout.write( input );
  } else if ( typeof( input ) === "function" ) {
    input(); 
  }
};

var verbose = function( input ) {
  if ( 'verbose' == mode[ process.pid ] || 'debug' == mode[ process.pid ] ) {
    logger( input, 'verbose' );
  }
};

var warn = function( input ) {
  logger( input, 'warn' );
};

var log_req = function( req, input) {
  if ( 'standard' == mode[ process.pid ] || 'verbose' == mode[ process.pid ] 
      || 'debug' == mode[ process.pid ] ) {

    input = input + " host:" + req.headers.host + " orig_host:" + req.headers['x-forwarded-for']
    logger( input, 'standard' );
  }
};

exports.mode = function( loglyMode ) {
  if ( 'standard' === loglyMode || 'verbose' === loglyMode || 'debug' === loglyMode ) {
    mode[ process.pid ] = loglyMode;
  } else {
    throw "Invalid logly mode ( should be one of: standard, verbose, debug )";
  }
};

exports.name = function( applicationName ) {
  name[ process.pid ] = applicationName;
};

exports.debug = debug;
exports.error = error;
exports.log = log;
exports.stdout = stdout;
exports.stderr = stderr;
exports.verbose = verbose;
exports.warn = warn;
exports.log_req = log_req;
