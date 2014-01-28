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
    
  find: function (req, res) {

  	if (req.param('id')) {

	  	Log.findOneById(req.param('id')).done(function(err, log) {

	  		if (err) {
					res.send(404, {error: 'Not Found'});
	  		} else {
	  			if (req.param('format')) {
	  				switch(req.param('format')) {
	  					case 'log': 
	  					  res.contentType('text');
						    return res.send(log.raw.toString(), {}, 201);
						    break;

					    case 'js':
					    	processed = ProcessService.process(log.json);
					    	res.contentType('javascript');
					    	return res.view('view/javascript', {'processed' : processed, layout: null});

					    default:
					    	res.send(404, {error: 'Not Found'});
					    	break;
	  				}
	  			} else {
	  				processed = ProcessService.process(log.json);
					  return res.view({
			  			'log' : log,
			  			'processed' : processed,
    			  	active: 'view'
    				});	
				  }
			  }
	  	});
	  } else {
	  	//Find a random one
	  	res.send(404, {error: 'Not Found'});
	  }

		
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ViewController)
   */
  _config: {}

  
};
