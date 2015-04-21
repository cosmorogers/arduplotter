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
        sails.log.debug("Processing Job", job.data.file.id);
        var time = process.hrtime();
        var file = job.data.file;
        var flightId = job.data.flight.id;

       	var csv = require("fast-csv");
 				
        var nameMappings = {
          'ctun' : {
              'dcrt' : 'dcrate',
              'crt'  : 'crate',
              'dsalt' : 'wpalt',
              'dalt' : 'wpalt',
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
          att: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems','rollin', 'roll', 'pitchin', 'pitch', 'yawin', 'yaw', 'navyaw']
          },
          cam: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['gpstime','gpsweek','lat','lng','alt','roll','pitch','yaw']
          },
          curr: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['thr', 'thrint', 'volt', 'curr', 'vcc', 'currtot']
          },
          ctun: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['thrin','sonalt','baralt','wpalt','navthr','angbst','crate','throut','dcrate','alt']
          },
          err: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['subsys' ,'ecode']
          },
       		fmt: { 
       			exists: false, 
       		},
          gps: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['status' ,'time' ,'nsats' ,'hdop' ,'lat' ,'lng' ,'relalt' ,'alt' ,'spd' ,'gcrs']
          },
          imu: {
            exists: false, mapped: false, mappings: {},
            hasColumns: [ 'timems','gyrx','gyry','gyrz','accx','accy','accz']
          },
          mag: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems' ,'magx' ,'magy' ,'magz' ,'ofsx','ofsy','ofsz','mofsx','mofsy','mofsz']
          },
          msg: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['msg']
          },
          ntun: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['wpdst','wpbrg','perx','pery','dvelx','dvely','velx','vely','dacx','dacy','drol','dpit']
          },
          param: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['name' ,'value']
          },
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

            if (rowNumber % 1000 == 0) {
              sails.sockets.blast("upload-progress", {id: flightId, msg: "Processing line " + rowNumber});
            }

					}) // end on data
					.on("end", function(){
						//update model
            sails.sockets.blast("upload-progress", {id: flightId, msg: "Saving data"});
            

            var async = require('async')
            async.each(Object.keys(channels), function(channel, cb) {
              
              sails.sockets.blast("upload-progress", {id: flightId, msg: "Saving data '" + channels[channel]._name + "'"});

              //This seems to be about a million percent faster than waterline....
              // Retrieve
              var MongoClient = require('mongodb').MongoClient;

              // Connect to the db
              MongoClient.connect("mongodb://localhost:27017/arduplotter", function(err, db) {
                if(err) { return console.dir(err); }

                var collection = db.collection('flightchannel');

                collection.insert(channels[channel]);

                cb();
              });

              /*
              FlightChannel.create(channels[channel]).exec(function(err, d) {
                if (err) {
                  sails.log.err('An error', err, data);
                }
                cb();
              })*/
            }, function (err) {
              sails.sockets.blast("upload-progress", {id: flightId, msg: "Done processing." });

              Flight.update(job.data.flight.id, {processed: true, 'logContains': logContains}, function(err, flight) {
                sails.log.debug("Processing done", {id: flightId, duration: process.hrtime(time)} );
                sails.sockets.blast("processed", {id: flightId});
                done();
              });
            });
					});


	      
    }

};
