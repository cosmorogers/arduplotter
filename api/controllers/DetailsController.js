/**
 * Details Controller
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
module.exports = {

	power: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			var capacity = 0;
  		if (typeof processed.params != "undefined" && typeof processed.params.batt_capacity != "undefined") {
  			capacity = parseFloat(processed.params.batt_capacity.value);
  		}

			res.contentType('javascript');
			return res.send({power: processed.curr, time: processed.gps.timeend - processed.gps.timestart, battery: capacity});
		});
	},

	altitude: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({gps: {alt : processed.gps.alt, relalt: processed.gps.relalt}, ctun: processed.ctun});
		});
	},

	attitude: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({att: processed.att});
		});
	},

	gps: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({gps: processed.gps});
		});
	},

	imu: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({imu: processed.imu.trimmed});
		});
	},

	messages: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({messages: processed.err});
		});
	},

	params: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({params: processed.params});
		});
	},

	markers: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);

			var backgroundColours = {
				'alt_hold': '#e7b1b2',
			    'stabilize': '#ecca9e',
			    'loiter': '#aad7a7',
			    'rtl' : '#fcc',
			    'auto' : '#cfc',
			    'manual': '#ccf',
			    'fbw_a' : '#ffc',
			};

			var markings = [];
		  for (var k in processed.mode.modes) {
		    markings.push({xaxis: { from: processed.mode.modes[k].start, to: processed.mode.modes[k].end },color: backgroundColours[processed.mode.modes[k].name.toLowerCase()], name: processed.mode.modes[k].name});
		  }

			res.contentType('javascript');
			return res.send({exists: processed.gps.exists, lat: processed.gps.lat.values, lng: processed.gps.lng.values, markings: markings});
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};


function loadLog(req, res, cb) {
  if (req.param('id')) {
    FlightLog.findOne(req.param('id'))
    .done(function(err, log) {
      if (err) {
            console.log("not found", res);

        return res.notfound();
	    } else {
        if (typeof log == 'undefined') {
          return res.notfound();
        } else {
          return cb(req, res, log);
        }
      }
    });
  } else {
    return res.notfound();
  }
}