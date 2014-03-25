/**
 * Log
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	filename: 'STRING',
  	createdAt: {
  		type: 'DATE',
  		index: true
  	}
    
  },

  afterCreate : function(flightlog, cb) {
  	FlightLogHeader.create({
    	filename: flightlog.filename,
    	logId: flightlog.id,
    	size: flightlog.size,
    }).done(function(err, data) {
    	if (err) {
    		return cb(err);
    	} else {
    		return cb();
    	}
    });
  }

};
