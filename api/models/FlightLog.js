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
    var processed = ProcessService.process(flightlog.json);

  	FlightLogHeader.create({
    	filename: flightlog.filename,
    	logId:    flightlog.id,
    	size:     flightlog.size,
      logContains: {
        att:  processed.att.exists,
        curr: processed.curr.exists,
        ctun: processed.ctun.exists,
        err:  processed.err.exists,
        gps:  processed.gps.exists,
        imu:  processed.imu.exists,
        ntun:  processed.ntun.exists
      },
      build: 1
    }).done(function(err, data) {
    	if (err) {
    		return cb(err);
    	} else {
    		return cb();
    	}
    });
  }

};
