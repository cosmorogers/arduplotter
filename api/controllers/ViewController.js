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
    return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
		  return res.view({
  			'log' : log,
  			'processed' : processed,
		  	active: 'view'
			});
    });
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
				return res.send(log.raw.toString(), {}, 201);
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
    Log.findOne(req.param('id'))
    .done(function(err, log) {
      if (err) {
        return res.send(404, {error: 'Not Found error'});
	    } else {
        if (typeof log == 'undefined') {
          return res.send(404, {error: 'Not Found'});
        } else {
          return cb(req, res, log);
        }
      }
    });
  } else {
    return res.send(404, {error: 'Not Found missing'});
  }
}
