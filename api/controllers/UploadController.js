/**
 * UploadController
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
    if (req.method === 'POST') {
      var fs = require('fs');       
      // read temporary file
      fs.readFile(req.files.log.path, function (err, data) {
        //console.log(data);
        // save file

        var csv = require('csv');
        csv()
          .from.string(data.toString(), {comment: '#'})
          .to.array( function(processedata){
            Log.create({
              filename: req.files.log.name,
//              raw: data,
              json: processedata
            }).done(function(err, data) {
              // Error handling
              if (err) {
                return console.log(err);
              } else {
                console.log("log created:", data);
                res.redirect('view/' + data.id);
              }
            });
          });
      });
    } else {
      // Send a JSON response
      return res.view({
        active: 'upload'
      });
    }
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};
