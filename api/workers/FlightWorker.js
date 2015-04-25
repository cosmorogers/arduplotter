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
        sails.log.debug("Processing Job", job.data.flight.id);
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
          },
          'msg' : {
              'message' : 'msg',
          },
          'ntun' : {
              'daccx' : 'dacx',
              'daccy' : 'dacy',
          }
        };

       	var knownData = {
          att: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems','rollin', 'roll', 'pitchin', 'pitch', 'yawin', 'yaw', 'navyaw', 'errrp', 'erryaw']
          },
          cam: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['gpstime','gpsweek','lat','lng','alt', 'relalt','roll','pitch','yaw']
          },
          curr: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems', 'thr', 'thrint', 'throut', 'volt', 'curr', 'vcc', 'currtot']
          },
          ctun: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems','thrin','sonalt','baralt','wpalt','navthr','angbst','crate','throut','dcrate','alt']
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
            hasColumns: ['status' ,'time' ,'week', 'nsats' ,'hdop' ,'lat' ,'lng' ,'relalt' ,'alt' ,'spd' ,'gcrs', 'vz', 't']
          },
          imu: {
            exists: false, mapped: false, mappings: {},
            hasColumns: [ 'timems','gyrx','gyry','gyrz','accx','accy','accz']
          },
          mag: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems' ,'magx' ,'magy' ,'magz' ,'ofsx','ofsy','ofsz','mofsx','mofsy','mofsz']
          },
          mode: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['mode', 'thrcrs']
          },
          msg: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['msg']
          },
          ntun: {
            exists: false, mapped: false, mappings: {},
            hasColumns: ['timems', 'dposx', 'dposy', 'posx', 'posy', 'dvelx','dvely','velx','vely','dacx','dacy','drol','dpit']
          },
          parm: {
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
            rowData = {_type: '', _row: rowNumber, _flight: flightId};

            if (row.length > 0) {
              rowName = row[0].trim().toLowerCase();
              if (rowName === 'fmt') {
                //Gonna assume FMT data is always in the same format :)
                //console.log(row);

                knownData.fmt.exists = true;
                val = row[3].trim().toLowerCase();
                formats = row[4].trim();
                columns = row.slice(5);
                
                //console.log(val, formats, columns);

                if (typeof knownData[val] != "undefined") { //I know about this FMT row 

                  if (val !== 'fmt') { //Not the FMT FMT data!
                    //Just cos in FMT doesn't mean there is any of it!
                    //logContains[val] = true; //the log contains this!

                    channels[val] = {};
                    //channels[val]['unknown'] = [];
                    for (i in columns) {
                      p = columns[i].trim().toLowerCase();
                      if (typeof nameMappings[val] != "undefined" && typeof nameMappings[val][p] != "undefined") {
                          p = nameMappings[val][p];
                      }

                      //Check if I know about this data type thingy
                      if (knownData[val].hasColumns.indexOf(p) > -1) {
                          column = parseInt(i) + 1;

                          channels[val][p] = { name: val,  flight: flightId, type: p, values: []};

                          knownData[val].mappings[column] = {
                            name: p,
                            format: formats.charAt(column - 1) // 0 indexed formats!
                          };
                      } else {
                        //OOOH some new data
                        sails.log.warn('New Log Data', {type: val, column: p, flight: flightId});
                      }
                    } //End for loop
                    knownData[val].mapped = true;
                  }
                } else {
                  //New FMT data
                  sails.log.warn('New Log Data', row );
                }

              //Special rows before auto collecting data below.
              } else if (rowName === 'parm') {

                if (typeof channels.parm.parm == "undefined") {
                  channels.parm = {
                    parm: { name: 'parm',  flight: flightId, type: 'parm', values: {}}
                  }
                  logContains.parm = true;
                }

                if (typeof knownData.parm.mappings != "undefined") {

                  parmName = '';
                  parmValue = '';

                  for (itemIndex in knownData.parm.mappings) {
                    itemName = knownData.parm.mappings[itemIndex].name;
                    itemFormat = knownData.parm.mappings[itemIndex].format;
                    val = FlightService.format(row[itemIndex], itemFormat);
                    if (itemName == "name") {
                      parmName = val;
                    } else if (itemName == "value") {
                      parmValue = val;
                    }
                  }

                  channels.parm.parm.values[parmName] = parmValue;
                }

              } else if (rowName === 'mode') {
                if (typeof channels.mode.mode == "undefined") {
                  channels.mode = {
                    mode: { name: 'mode',  flight: flightId, type: 'mode', values: []}
                  }
                  logContains.mode = true;
                }

                if (typeof knownData.mode.mappings != "undefined") {

                  modeOb = {
                    name: '',
                    thrcrs: 0,
                    start: rowNumber,
                    end: 0
                  };

                  for (itemIndex in knownData.mode.mappings) {
                    itemName = knownData.mode.mappings[itemIndex].name;
                    itemFormat = knownData.mode.mappings[itemIndex].format;
                    val = FlightService.format(row[itemIndex], itemFormat);
                    if (itemName == "mode") {
                      modeOb.name = val;
                    } else if (itemName == "thrcrs") {
                      modeOb.thrcrs = val;
                    }
                  }

                  noOfModes = channels.mode.mode.values.length
                  if (noOfModes > 0) {
                    modeOb.end = channels.mode.mode.values[noOfModes - 1].start;
                  }

                  channels.mode.mode.values.push(modeOb);
                }

              } else if (typeof knownData[rowName] != "undefined") {
                //Automatically add row, value to the correct channel data
                logContains[rowName] = true; //the log contains this
                for (colIndex in row) {
                  if (colIndex > 0) { // Don't process the first element in the row!
                    if (typeof knownData[rowName].mappings[colIndex] !=  "undefined") {

                      itemName = knownData[rowName].mappings[colIndex].name;
                      itemFormat = knownData[rowName].mappings[colIndex].format;

                      channels[rowName][itemName].values.push([rowNumber, FlightService.format(row[colIndex], itemFormat)]);

                    } else {
                      //Hmm appears to be a unmapped row index. I wonder what it could be...
                      //unknown data we can pull from S3 when redoing
                    }
                  }
                }

              } //else unknown row, but fmt should have taken care of alerting me

            } // else no data length

            if (rowNumber % 1000 == 0) {
              sails.sockets.blast("upload-progress", {id: flightId, msg: "Processing line " + rowNumber});
            }

					}) // end on data
					.on("end", function(){

            //Clean up averages, etc
            noOfModes = channels.mode.mode.values.length
            if (noOfModes > 0) {
              channels.mode.mode.values[noOfModes - 1].end = rowNumber;
            }

						//update flight
            sails.sockets.blast("upload-progress", {id: flightId, msg: "Saving data"});
            
            //This seems to be about a million percent faster than waterline....
            // Retrieve
            var MongoClient = require('mongodb').MongoClient;

            // Connect to the db
            MongoClient.connect("mongodb://localhost:27017/arduplotter", function(err, db) {
              if(err) { return console.dir(err); }
              var collection = db.collection('flightchannel');

              var async = require('async')
              async.each(Object.keys(channels), function(channel, cb) {
                
                sails.sockets.blast("upload-progress", {id: flightId, msg: "Saving data '" + channel + "'"});              

                async.each(Object.keys(channels[channel]), function(type, tcb) {
                  if (typeof channels[channel][type].values != "undefined") {
                    if (Array.isArray(channels[channel][type].values)) {
                      length = channels[channel][type].values.length;
                    } else {
                      //Humm
                      length = Object.keys(channels[channel][type].values).length;
                    }
                    //console.log("Saving " + channel + " " + type + " [" + length + "]");
                    if (length > 0) {
                      //Only insert if there is actually any data!
  /*                    FlightChannel.create(channels[channel][type], function(err, flight){
                        if (err) {
                          sails.log.error(err);
                        } else {
                          tcb();
                        }
                      });*/

                      collection.insert(channels[channel][type], function(err, result) {
                        if (err) {
                          //oh
                          sails.log.error(err);
                          tcb(err);
                        } else {
                          tcb();
                        }
                      });

                    } else {
                      tcb();
                    }
                  } else {
                    tcb();
                  }

                }, function (err) {
                  cb();
                });

              }, function (err) {
                channels = null;
                sails.sockets.blast("upload-progress", {id: flightId, msg: "Done processing." });

                //need to add file size, file hash, loganalizer result filename
                //need to move upload somewhere nice

                updateData = {
                  processed: true,
                  logContains: logContains,
                  size: job.data.file.size,
                  filehash: job.data.hash,
                };

                Flight.update(job.data.flight.id, updateData, function(err, flight) {
                  sails.log.debug("Processing done", {id: flightId, duration: process.hrtime(time)} );
                  sails.sockets.blast("processed", {id: flightId});
                  done();
                });
              });
            });
					});


	      
    }

};
