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


      req.file('flightlog').upload(function( err, files) {
        if (err) {

        } else {
          //Do quick initial filter
          var file = files[0];
          if (mime.lookup(file.fd) == 'text/plain') {

            sails.log.silly(["File upload", file]);
            
            var publisher = sails.hooks.publisher;

            //Create a flight to redirect the user to
            Flight.create({
              processed: false,
            }, function (err, flight){

              if (err) {

              } else {
                 //Create a job to process this new flight
                var job = publisher.create('flight', {
                  'title'  : 'Processing Log', //title for kue
                  'file'   : file, //the file to process
                  'flight' : flight //the flight reference
                }).save();

                //Redirect the user to the log page (will show it as processing until complete)
                var url = 'view/' + flight.id;
                if (req.isAjax || req.isJson) {
                  return res.send({redirect: url});
                } else {                
                  return res.redirect(url);
                }
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


     /* if (mime.lookup(req.files.flightlog.path) == 'text/plain') {

        fs.stat(req.file('flightlog').path, function (err, stats) {
          fs.readFile(req.files.flightlog.path, function (err, data) {
            //console.log(data);
            // save file

            var csv = require('csv');
            csv()
              .from.string(data.toString(), {comment: '#'})
              .to.array( function(processedata){
                FlightLog.create({
                  filename: req.files.flightlog.name,
                  size: stats.size,
    //              raw: data,
                  json: processedata
                }).done(function(err, data) {
                  // Error handling
                  if (err) {
                    console.error(new Date().toUTCString() + " ::UPLOAD:: " + err);

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
                    //Check is json upload
                    console.log("log created");
                    if (req.isAjax || req.isJson) {
                      res.send({redirect: 'view/' + data.id});
                    } else {                
                      res.redirect('view/' + data.id);
                    }
                  }
                });
              });
          });
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
      }*/
    } else {
      // Send a JSON response
      return res.view({
        active: 'upload',
        error: false,
        toobig: false
      });
    }
  },

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};
