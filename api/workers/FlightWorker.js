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
        var flightId = job.data.flight.id;

       	var csv = require("fast-csv");
 				
        var nameMappings = {
          'ctun' : {
              'dcrt' : 'dcrate',
              'crt'  : 'crate',
              'dsalt' : 'wpalt',
              'salt' : 'sonalt'
          },
          'att' : {
              'desroll' : 'rollin',
              'despitch' : 'pitchin',
              'desyaw' : 'yawin',
          },
          'gps' : {
              'timems' : 'time',
          }
        };

       	var knownData = {
       		fmt: { 
       			exists: false, 
       		},
          gps: {
            exists: false,
            mapped: false,
            hasColumns: ['status' ,'time' ,'nsats' ,'hdop' ,'lat' ,'lng' ,'relalt' ,'alt' ,'spd' ,'gcrs'],
            mappings: {}
          }
       	}

        var logContains = {};
        var rowNumber = 0;
        var totals = {};

        var channels = {};
        //var fs = require('fs');
        //var stream = fs.createReadStream(file.fd);

				csv
					.fromPath(file.fd)
					.on("data", function(row){
						//A row of the log. Do something interesting with it.
            rowNumber++;
            var rowData = {_type: '', _row: rowNumber, _flight: flightId};

            if (row.length > 0) {
              var rowName = row[0].trim().toLowerCase();
              if (rowName === 'fmt') {
                //Gonna assume FMT data is always in the same format :)
                //console.log(row);

                knownData.fmt.exists = true;
                var val = row[3].trim().toLowerCase();
                var formats = row[4].trim();
                var columns = row.slice(5);
                
                //console.log(val, columns);

                if (typeof knownData[val] != "undefined" && val !== 'fmt') {
                  logContains[val] = true; //the log contains this!
                  channels[val] = {_name: val, _flight: flightId};
                  //channels[val]['unknown'] = [];
                  for (var i in columns) {
                    var p = columns[i].trim().toLowerCase();
                    if (typeof nameMappings[val] != "undefined" && typeof nameMappings[val][p] != "undefined") {
                        p = nameMappings[val][p];
                    }

                    if (knownData[val].hasColumns.indexOf(p) > -1) {
                        var column = parseInt(i) + 1;

                        channels[val][p] = [];

                        knownData[val].mappings[column] = {
                          name: p,
                          format: formats.charAt(column)
                        };
                    } else {
                      //OOOH some new data
                      sails.log.warn('New Log Data', {type: val, column: p, flight: flightId});
                    }
                  };
                  knownData[val].mapped = true;
                }
              } else if (typeof knownData[rowName] != "undefined") {
                //Underscore these so don't conflict with possible data in log
                
                for (var colIndex in row) {
                  if (colIndex > 0) {
                    if (typeof knownData[rowName].mappings[colIndex] !=  "undefined") {

                      var itemName = knownData[rowName].mappings[colIndex].name;
                      var itemFormat = knownData[rowName].mappings[colIndex].format;

                      channels[rowName][itemName].push([rowNumber, FlightService.format(row[colIndex], itemFormat)]);

                    } else {
                      //Hmm appears to be a unmapped row index. I wonder what it could be...
                      hasUnmapped = true;
                      //unknown data we can pull from S3 when redoing

                      //channels[rowName]['unknown'].push({'row': rowNumber, index: colIndex, value: row[colIndex]});
                    }
                  }
                }

                /*
                rowData._type  = rowName
                var hasUnmapped = false;
                var unmapped = {};

                for (var colIndex in row) {
                  if (colIndex > 0) {
                    if (typeof knownData[rowName].mappings[colIndex] !=  "undefined") {
                      var itemName = knownData[rowName].mappings[colIndex].name;
                      var itemFormat = knownData[rowName].mappings[colIndex].format;
                      //Have mapped this row index
                      rowData[itemName] = FlightService.format(row[colIndex], itemFormat);
                    } else {
                      //Hmm appears to be a unmapped row index. I wonder what it could be...
                      hasUnmapped = true;
                      unmapped[colIndex] = row[colIndex];
                    }
                  }
                }

                if (hasUnmapped) {
                  rowData['_unmapped'] = unmapped;
                }

              } else {
                //Some new row we don't know about!
                rowData.type = "unknown";
                rowData['data'] = row;

                //sails.log.warn('Unkown Log Data', data);
              }

              //save rowData!
              //saveme.push(rowData);
              
              FlightDetail.create(rowData, function(err, data) {
                if (err) {
                  sails.log.err('An error', err, data);
                }
              })*/

              } //else unknown row, but fmt should have taken care of alerting me

            } // else no data length
            
					}) // end on data
					.on("end", function(){
						//update model
            
            for (c in channels) {
              FlightChannel.create(channels[c], function(err, d) {
                if (err) {
                  sails.log.err('An error', err, data);
                }
              })
            }

						Flight.update(job.data.flight.id, {processed: true, 'logContains': logContains}, function(err, flight) {
							sails.log.debug("Processing done", {id: flightId, duration: process.hrtime(time)} );	
              sails.sockets.blast("processed", {id: flightId});
							done();
						});


						
					});


	      
    }

};
