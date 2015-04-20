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
      Flight.findOne(req.param('id'), function(err, log) {
        if (err) {
          return res.notFound();
        } else {
          if (typeof log == 'undefined') {
            return res.notFound();
          } else {
            
            /*if (typeof log.build == "undefined" || log.build < 2) {
              return res.redirect('rebuild/' + log.logId);
            }*/

            if (log.processed) {
              console.log(log);
              return res.view({
                'log' : log,
                //'processed' : processed
              });
            } else {
              return res.view('view/processing', { flight: log });
            }
          }
        }
      });
    } else {
      return res.notFound();
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
    var perPage = 20;
    var page = 1;

    FlightLogHeader.count(function(err, num) {
      if (!err) {
        var count = num;
        var page = 1;
        if (req.param('page') && req.param('page') > 0) {
          page = parseInt(req.param('page'));
        }
        var perPage = 20;
        var pages = Math.ceil(count / perPage);

        if (page > pages) {
          page = pages;
        }

        var skip = (page - 1) * perPage;
        
        FlightLogHeader.find()
          .sort('createdAt DESC')
          .limit(perPage)
          .skip(skip)
          .exec(function(err, logs) {
            if (err) {
              console.log(err);
            } else {
              return res.view({
                'count': count,
                'page' : page,
                'pages': pages,
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
            }
            header.logContains.att  = processed.att.exists;
            header.logContains.curr = processed.curr.exists;
            header.logContains.ctun = processed.ctun.exists;
            header.logContains.err  = processed.err.exists;
            header.logContains.gps  = processed.gps.exists;
            header.logContains.imu  = processed.imu.exists;
            header.logContains.ntun  = processed.ntun.exists;
            header.logContains.mag  = processed.mag.exists;


            header.build = 2;

            // save the updated value
            header.save(function(err) {
              // value has been saved
              console.log("Saved", header);
            });

            return res.redirect('view/' + header.logId);
          }
      });
    });

    return;
  },


  map: function (req, res) {
    return loadLog(req, res, function(req, res, log) {
      processed = ProcessService.process(log.json);

      var path = [];
      var flight = [];

      for(var i = 0; i < processed.gps.time.values.length; i++) { 
        //path.push(processed.gps.time.values[i][1]);
        flight.push(i);
        flight.push(processed.gps.lng.values[i][1]);
        flight.push(processed.gps.lat.values[i][1]);
        flight.push(processed.gps.alt.values[i][1]);
/*
        path.push(processed.gps.lng.values[i][1]);
        path.push(processed.gps.lat.values[i][1]);
        path.push(processed.gps.relalt.values[i][1]);*/
      }
      return res.view({path: path, flight: flight, layout: null});
    });
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
    return res.notFound();
  }
}
