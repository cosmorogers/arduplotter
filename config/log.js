/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#/documentation/concepts/Logging
 */
var winston = require('winston');
require('winston-loggly');

var customLogger = new winston.Logger({
    transports: [
        new(winston.transports.Loggly)({
            level: 'debug',
            token: '24aa7f32-a33a-4764-a8df-0749fa0079f5',
            subdomain: 'cosmorogers',
            tags: ['NodeJS'],
            json: true,
            stripColors: true
        }),
    ],
});


module.exports.log = {
  colors: false,  // To get clean logs without prefixes or color codings
  //custom: customLogger,
  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  level: 'debug'

};
