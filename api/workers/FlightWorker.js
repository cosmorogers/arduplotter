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
          atde: {
            mapped: false, mappings: {},
            hasColumns: ['angle', 'rate']
          },
          att: {
            mapped: false, mappings: {},
            hasColumns: ['timems','rollin', 'roll', 'pitchin', 'pitch', 'yawin', 'yaw', 'navyaw', 'errrp', 'erryaw']
          },
          atun: {
            mapped: false, mappings: {},
            hasColumns: ['axis','tunestep','ratemin','ratemax','rpgain','rdgain','spgain']
          },
          baro: {
            mapped: false, mappings: {},
            hasColumns: ['timems','alt','press','temp','crt']
          },
          cam: {
            mapped: false, mappings: {},
            hasColumns: ['gpstime','gpsweek','lat','lng','alt', 'relalt','roll','pitch','yaw']
          },
          cmd: {
            mapped: false, mappings: {},
            hasColumns: ['timems','ctot','cnum','cid','prm1','prm2','prm3','prm4','lat','lng','alt']
          },
          curr: {
            mapped: false, mappings: {},
            hasColumns: ['timems', 'thr', 'thrint', 'throut', 'volt', 'curr', 'vcc', 'currtot']
          },
          ctun: {
            mapped: false, mappings: {},
            hasColumns: ['timems','thrin','sonalt','baralt','wpalt','navthr','angbst','crate','throut','dcrate','alt']
          },
          d16: {
            mapped: false, mappings: {},
            hasColumns: ['id' ,'value']
          },
          d32: {
            mapped: false, mappings: {},
            hasColumns: ['id' ,'value']
          },
          dflt: {
            mapped: false, mappings: {},
            hasColumns: ['id' ,'value']
          },
          du16: {
            mapped: false, mappings: {},
            hasColumns: ['id' ,'value']
          },
          du32: {
            mapped: false, mappings: {},
            hasColumns: ['id' ,'value']
          },
          err: {
            mapped: false, mappings: {},
            hasColumns: ['subsys' ,'ecode']
          },
          ev: {
            mapped: false, mappings: {},
            hasColumns: ['id']
          },
       		fmt: { 
       			 
       		},
          gps: {
            mapped: false, mappings: {},
            hasColumns: ['status' ,'time' ,'week', 'nsats' ,'hdop' ,'lat' ,'lng' ,'relalt' ,'alt' ,'spd' ,'gcrs', 'vz', 't']
          },
          imu: {
            mapped: false, mappings: {},
            hasColumns: [ 'timems','gyrx','gyry','gyrz','accx','accy','accz']
          },
          mag: {
            mapped: false, mappings: {},
            hasColumns: ['timems' ,'magx' ,'magy' ,'magz' ,'ofsx','ofsy','ofsz','mofsx','mofsy','mofsz']
          },
          mode: {
            mapped: false, mappings: {},
            hasColumns: ['mode', 'thrcrs']
          },
          msg: {
            mapped: false, mappings: {},
            hasColumns: ['msg']
          },
          ntun: {
            mapped: false, mappings: {},
            hasColumns: ['timems', 'dposx', 'dposy', 'posx', 'posy', 'dvelx','dvely','velx','vely','dacx','dacy','drol','dpit']
          },
          of: {
            mapped: false, mappings: {},
            hasColumns: ['dx','dy','squal','x','y','roll','pitch']
          },
          parm: {
            mapped: false, mappings: {},
            hasColumns: ['name' ,'value']
          },
          pm: {
            mapped: false, mappings: {},
            hasColumns: ['nlon','nloop','maxt','pmt','i2cerr','inserr','inaverr' ]
          },
          powr: {
            mapped: false, mappings: {},
            hasColumns: ['timems','vcc','vservo','flags']
          },
          rad: {
            mapped: false, mappings: {},
            hasColumns: ['timems','rssi','remrssi','txbuf','noise','remnoise','rxerrors','fixed']
          },
          rcin: {
            mapped: false, mappings: {},
            hasColumns: ['timems', 'c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14']
          },
          rcou: {
            mapped: false, mappings: {},
            hasColumns: ['timems', 'chan1', 'chan2', 'chan3', 'chan4', 'chan5', 'chan6', 'chan7', 'chan8']
          },
          strt: {
            mapped: false, mappings: {},
            hasColumns: []
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
					.on("data", function(row) {
						//A row of the log. Do something interesting with it.
            //console.log(row);

            rowNumber++;
            rowData = {_type: '', _row: rowNumber, _flight: flightId};

            if (row.length > 0) {
              rowName = row[0].trim().toLowerCase();
              if (rowName === 'fmt') {
                //Gonna assume FMT data is always in the same format :)

                val = row[3].trim().toLowerCase();
                formats = row[4].trim();
                columns = row.slice(5);
                
                //console.log(val, formats, columns);

                if (typeof knownData[val] != "undefined") { //I know about this FMT row 

                  if (val !== 'fmt' && !knownData[val].mapped) { //Not the FMT FMT data, and not already mapped!
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
                      itemValue = FlightService.format(row[colIndex], itemFormat);

                      channels[rowName][itemName].values.push([rowNumber, itemValue]);

                      if (rowName == "gps" && itemName == 'spd') {
                        if (typeof channels.gps.avgspd == "undefined") {
                          channels.gps.avgspd = { name: "gps",  flight: flightId, type: "avgspd", values: [], average: 0 }
                        }

                        channels.gps.avgspd.average += itemValue;
                        channels.gps.avgspd.values.push([rowNumber, channels.gps.avgspd.average / channels.gps.spd.values.length]);

                      }

                      if (rowName == "curr") {

                        if (itemName == "vcc") {
                          //VCC for some unknown reason it *1000...
                          vcc = channels.curr.vcc.values[channels.curr.vcc.values.length - 1][1] / 1000;
                          channels.curr.vcc.values[channels.curr.vcc.values.length - 1][1] = vcc;
                        } else if (itemName == "volt") {
                          //volt is *100....
                          volt = channels.curr.volt.values[channels.curr.volt.values.length - 1][1] / 100;
                          channels.curr.volt.values[channels.curr.volt.values.length - 1][1] = volt;

                        } else if (itemName == "curr") {
                          //curr is *100
                          curr = channels.curr.curr.values[channels.curr.curr.values.length - 1][1] / 100;
                          channels.curr.curr.values[channels.curr.curr.values.length - 1][1] = curr;

                          if (typeof channels.curr.avgcurr == "undefined") {
                            channels.curr.avgcurr = { name: "curr",  flight: flightId, type: "avgcurr", values: [], average: 0 }
                          }

                          channels.curr.avgcurr.average += curr;
                          channels.curr.avgcurr.values.push([rowNumber, channels.curr.avgcurr.average / channels.curr.curr.values.length]);                        
                        }
                      }

                    } else {
                      //Hmm appears to be a unmapped row index. I wonder what it could be...
                      //unknown data we can pull from S3 when redoing
                    }
                  }
                }

                if (rowName == "mag" && typeof channels.mag.magx != "undefined" && typeof channels.mag.magy != "undefined" && typeof channels.mag.magz != "undefined") {
                  //Calculate special magentic field after auto adding data above :)
                  x = channels.mag.magx.values[channels.mag.magx.values.length -1][1];
                  y = channels.mag.magy.values[channels.mag.magy.values.length -1][1];
                  z = channels.mag.magz.values[channels.mag.magz.values.length -1][1];
                  f = Math.sqrt( Math.pow(Math.abs(x),2) + Math.pow(Math.abs(y),2) + Math.pow(Math.abs(z),2) );

                  if (typeof channels.mag.magfield == "undefined") {
                    channels.mag.magfield = { name: "mag",  flight: flightId, type: "magfield", values: [] };
                  }

                  channels.mag.magfield.values.push([rowNumber, f]);
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

/* Totally reduntant, just get last avgspd!!!
            if (typeof channels.gps.avgspd != "undefined") {
              if (typeof channels.gps.totavgspd == "undefined") {
                average = channels.gps.avgspd.average / channels.gps.avgspd.values.length;
                channels.gps.totavgspd = { name: "gps",  flight: flightId, type: "totavgspd", values: [[0, average]] }
              }
            }
*/


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
