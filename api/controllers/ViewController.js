/**
 * ViewController
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
    
  index: function (req, res) {
    /*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
		  return res.view({
  			'log' : log,
  			'processed' : processed
			});
    });*/
    if (req.param('id')) {
      FlightLogHeader.findOneByLogId(req.param('id'))
        .done(function(err, log) {
        if (err) {
          return res.notfound();
        } else {
          if (typeof log == 'undefined') {
            return res.notfound();
          } else {
            processed = ProcessService.process(log.json);
            return res.view({
              'log' : log,
              'processed' : processed
            });
          }
        }
      });
    } else {
      return res.notfound();
    }

  },

  javascript: function (req, res) {
	  	return loadLog(req, res, function(req, res, log) {
        processed = ProcessService.process(log.json);
				res.contentType('javascript');
				return res.view('view/javascript', {'processed' : processed, layout: null});
      });
  },

  log: function (req, res) {
      return loadLog(req, res, function(req, res, log) {
        res.contentType('text');
        return res.view('view/log', {'json' : log.json, layout: null});
      });
  },

  kml: function (req, res) {
      return loadLog(req, res, function(req, res, log) {
        processed = ProcessService.process(log.json);
        res.contentType('application/vnd.google-earth.kml+xml');
        return res.view('view/kml', {'processed' : processed, layout: null});
      });
  },

  browse: function (req, res) {
    var perPage = 1;
    var page = 1;

    FlightLogHeader.count(function(err, num) {
      if (!err) {
        var count = num;
        
        FlightLogHeader.find()
          .sort('createdAt DESC')
          .exec(function(err, logs) {
            if (err) {
              console.log(err);
            } else {
              return res.view({
                'count': count,
                'page' : page,
                'logs' : logs
              });
            }
        });
      }
    });
  },

  rebuild: function (req, res) {
    return loadLog(req, res, function(req, res, log) {
      processed = ProcessService.process(log.json);
        
      FlightLogHeader.findOneByLogId(log.id).done(function(err, header) {
          if (err) {

          } else {
            console.log (header, log.id);
            if (typeof header != "undefined") {
              header.logContains = {};
              header.logContains.att  = processed.att.exists;
              header.logContains.curr = processed.curr.exists;
              header.logContains.ctun = processed.ctun.exists;
              header.logContains.err  = processed.err.exists;
              header.logContains.gps  = processed.gps.exists;
              header.logContains.imu  = processed.imu.exists;

              // save the updated value
              header.save(function(err) {
                // value has been saved
                console.log("Saved", header);
              });
            }
            return res.redirect('view');
          }
      });
    });

return;
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ViewController)
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
