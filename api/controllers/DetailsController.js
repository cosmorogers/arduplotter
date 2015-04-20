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
		flightId = req.param('id').trim();
		var lats = [], lngs = [], status = [], hdop = [], nsats = [], spd = [], time = [], relalt = [], alt = [], gcrs =[];

		FlightChannel
			.findOne()
			.where({_flight: flightId})
			.where({_name: 'gps'})
			.exec(function(err, channel){
				res.contentType('javascript');
				return res.send({gps: channel});

			});

		
	},

	imu: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({imu: processed.imu.trimmed});
		});
	},

	ntun: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({ntun: processed.ntun});
		});
	},

	mag: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({mag: processed.mag, thr: processed.ctun.thrin});
		});
	},

	messages: function(req, res) {
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			var warnings = [];

			if (!processed.fmt.exists) {
				warnings.push('FMT data missing from log. Some data may be incorrect. <a href="/help/errors#fmt">More on this problem</a>');
			}

			res.contentType('javascript');
			return res.send({messages: processed.err, 'warnings': warnings});
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
		return res.notFound();
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);

			var backgroundColours = {
				'alt_hold': '#e7b1b2',
				'althold': '#e7b1b2',
		    'stabilize': '#ecca9e',
		    'loiter': '#aad7a7',
		    'rtl' : '#fcc',
		    'land': '#e2dade',
		    'auto' : '#cfc',
		    'manual': '#ccf',
		    'fbw_a' : '#ffc',
		    'poshold': '#f8e8a6',
			};

			var markings = [];
		  for (var k in processed.mode.modes) {
		    markings.push({xaxis: { from: processed.mode.modes[k].start, to: processed.mode.modes[k].end },color: backgroundColours[processed.mode.modes[k].name.toLowerCase()], name: processed.mode.modes[k].name});
		  }

			res.contentType('text/plain');
			return res.send({
				exists: (processed.gps.exists || processed.cam.exists), 
				lat: processed.gps.lat.values, 
				lng: processed.gps.lng.values, 
				markings: markings, 
				cam: {lat: processed.cam.lat.values, lng: processed.cam.lng.values},
				readings: {
					first: processed.gps.readings[0],
					last: processed.gps.readings[processed.gps.readings.length - 1],
					length: processed.gps.readings.length
				}
			});
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
    FlightDetail.find({_flight: req.param('id')}, function(err, logs) {
      if (err) {
            console.log("not found", res);

        return res.notFound();
	    } else {
        if (typeof log == 'undefined') {
          return res.notFound();
        } else {
          return cb(req, res, log);
        }
      }
    });
  } else {
    return res.notfound();
  }
}