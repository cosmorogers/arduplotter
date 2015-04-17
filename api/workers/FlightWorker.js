/**
 * @description a worker to perform `flight` job type
 * @type {Object}
 */
module.exports = {
    //specify worker
    //job concurrency
    concurrency: 2,

    //perform sending email
    //job
    perform: function(job, done, context) {
        sails.log.debug("Got job", job.data.file);
        var time = process.hrtime();
        var file = job.data.file;

       	var csv = require("fast-csv");
 				

       	var knownData = {
       		fmt: { 
       			exists: false, 
       			data: { type: [], length: [], name: [], format: [], columns: [] }
       		}
       	}

       	fmt : {
       		type:
       	}


       	baro : {
       		timems : 1,
       		alt    : 1,
       		press  : 2,
       		temp   : 3,
       		crt    : 5,
       	}


				csv
					.fromPath(file.fd)
					.on("data", function(data){
						//A row of the log. Do something interesting with it.

						


					})
					.on("end", function(){
						

						//update model
						Flight.update(job.data.flight.id, {processed: true}, function(err, flight) {
							sails.log.debug("Processing done", {id: job.data.flight.id, duration: process.hrtime(time)} );	
							done();
						});


						
					});


	      
    }

};
