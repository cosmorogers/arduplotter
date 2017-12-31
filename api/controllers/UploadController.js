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
      //Validate uploaded file
      var mime = require('mime');


      req.file('flightlog').upload({
        maxBytes: 50000000
      }, function( err, files) {
        if (err) {

          sails.log.info("Upload error", err);
          if (req.isAjax || req.isJson) {
            return res.send({error: 'toobig'});
          } else {                
            return res.view({
              active: 'upload',
              error: false,
              toobig: true
            });
          }

        } else {
          //Do quick initial filter
          var file = files[0];
          if (mime.lookup(file.fd) == 'text/plain') {

            sails.log.info(["File upload", file]);
            
            var publisher = sails.hooks.publisher;

            //Create a flight to redirect the user to
            Flight.create({
              processed: false,
            }, function (err, flight){

              if (err) {

              } else {

                var crypto = require('crypto'), fs = require('fs');
                fs.readFile(file.fd, function (err, data) {
                  hash = crypto.createHash('md5')
                               .update(data, 'utf8')
                               .digest('hex');
              
                   //Create a job to process this new flight
                  var job = publisher.create('flight', {
                    'title'  : 'Processing Log', //title for kue
                    'file'   : file, //the file to process
                    'flight' : flight, //the flight reference
                    'hash'   : hash //the file hash
                  }).save();

                  //Redirect the user to the log page (will show it as processing until complete)
                  var url = 'view/' + flight.id;
                  if (req.isAjax || req.isJson) {
                    return res.send({redirect: url});
                  } else {                
                    return res.redirect(url);
                  }

                });
              }

            }); 


            

          } else {
            //Not a plain text file
            if (req.isAjax || req.isJson) {
              return res.send({error: 'invalid'});
            } else {                
              return res.view({
                active: 'upload',
                error: true,
                toobig: false
              });
            }
          }
        }        
      });

    } else {
      // Send a JSON response
      return res.view({
        active: 'upload',
        error: false,
        toobig: false
      });
    }
  },

  migrate: function (req, res) {
    var publisher = sails.hooks.publisher;

    var job = publisher.create('migrate').save();

    return res.send("Done");
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};
