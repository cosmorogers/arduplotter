/**
 * @description a worker to perform `migrate` job type
 * @type {Object}
 */
module.exports = {
    //specify worker
    //job concurrency
    concurrency: 1,

    //perform job
    perform: function(job, done, context) {
			
			FlightLogHeader.find()
        .exec(function(err, logs) {
          if (err) {
            console.log(err);
          } else {
						var http = require('http');
						var fs = require('fs');
						var publisher = sails.hooks.publisher;
						var ObjectID = require('mongodb').ObjectID;
						var crypto = require('crypto');

          	var async = require('async')
          	async.each(logs, function(log, cb) {

						  var file = fs.createWriteStream(".tmp/" + log.logId);
						  var url = "http://localhost:1338/view/" + log.logId + ".log";
						  var request = http.get(url, function(response) {
						    response.pipe(file);
						    file.on('finish', function() {
						    	console.log("Downloaded ", url);
						      file.close(function() {
						      	console.log("Closed");

						      	var fd = {fd : file.path, size: log.size }

						      	Flight.create({
						      		_id: new ObjectID(log.logId),
				              processed: false,
				            }, function (err, flight){

				              if (err) {
				              	console.log("oh dear");
				              	fs.unlink(fd.fd);
				              	//move on
				              } else {

				                
				                fs.readFile(fd.fd, function (err, data) {
				                  hash = crypto.createHash('md5')
				                               .update(data, 'utf8')
				                               .digest('hex');
				              
				                  //Create a job to process this new flight
				                  flight.id = log.logId;

				                 var job = publisher.create('flight', {
				                    'title'  : 'Processing Log', //title for kue
				                    'file'   : fd, //the file to process
				                    'flight' : flight, //the flight reference
				                    'hash'   : hash //the file hash
				                  }).save();
				                  
				                }); //end hash
				              }

				            }); 



						      });  // close() is async, call cb after close completes.
						    });
						  }).on('error', function(err) { // Handle errors
						    fs.unlink(dest); // Delete the file async. (But we don't check the result)
						  });

						  cb();
						}); //end for logs	
           
          }

          done();
      });

    }

  };