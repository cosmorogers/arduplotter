/**
 * Details Controller
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

	power: function(req, res) {
		return loadLog(req,res, ['gps', 'curr', 'parm'], ['curr', 'currtot', 'volt', 'vcc', 'avgcurr', 'parm', 'timems', 'time'], function( req, req, data) {
			var capacity = 0;

			if (typeof data.parm.parm != "undefined" && typeof data.parm.parm.BATT_CAPACITY != "undefined") {
				capacity = data.parm.parm.BATT_CAPACITY;
			}

			duration = 0;
			//GPS seems better for duration
			if (typeof data.gps != "undefined" && typeof data.gps.time != "undefined") {
				duration = (data.gps.time[data.gps.time.length - 1][1] - data.gps.time[0][1]) / 1000;
			} else if (typeof data.curr != "undefined" && typeof data.curr.timems != "undefined") {
				duration = data.curr.timems[data.curr.timems.length - 1][1] - data.curr.timems[0][1];
			}

			toSend = {
				power: data.curr, 
				time: duration, 
				battery: capacity
			}

			res.contentType('javascript');
			return res.send(toSend);			
		});
		/*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			var capacity = 0;
  		if (typeof processed.params != "undefined" && typeof processed.params.batt_capacity != "undefined") {
  			capacity = parseFloat(processed.params.batt_capacity.value);
  		}

			res.contentType('javascript');
			return res.send({power: processed.curr, time: processed.gps.timeend - processed.gps.timestart, battery: capacity});
		});*/
	},

	altitude: function(req, res) {
		return loadAndSend(req,res, ['ctun', 'gps'], ['relalt', 'alt', 'wpalt', 'baralt', 'thrin', 'throut', 'crate', 'dcrate']);
	},

	attitude: function(req, res) {
		return loadAndSend(req,res,'att', ['rollin', 'roll', 'pitchin', 'pitch', 'yawin', 'yaw', 'navyaw']);

	},

	gps: function(req, res) {
		return loadAndSend(req,res,'gps', ['lat', 'lng', 'nsats', 'status', 'spd', 'hdop', 'avgspd']);
	},

	imu: function(req, res) {
		return loadLog(req, res, 'imu', ['accx', 'accy', 'accz'], function(req, res, data) {
			toSend = {
				accx: RDPsd(data.imu.accx, 3),
				accy: RDPsd(data.imu.accy, 3),
				accz: RDPsd(data.imu.accz, 3)
			}
			res.contentType('javascript');
			return res.send({imu: toSend});

		});
	},

	ntun: function(req, res) {
		return loadAndSend(req,res,'ntun', ['velx', 'dvelx', 'vely', 'dvely']);
		
	},

	mag: function(req, res) {
		return loadAndSend(req,res, ['mag', 'ctun'], ['thrin', 'magfield']);
		/*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({mag: processed.mag, thr: processed.ctun.thrin});
		});*/
	},

	messages: function(req, res) {
		return loadLog(req,res, ['msg', 'err'] , ['msg', 'subsys', 'ecode'], function(rq,rs,data) {

			if (typeof data.err != "undefined") {
				if (typeof data.err.subsys != "undefined" && typeof data.err.ecode != "undefined" && data.err.subsys.length == data.err.ecode.length) {
					data.err.err = [];

					for (i in data.err.subsys) {
						//																						row										subsys									code
						data.err.err.push(FlightService.getErrorMsg(data.err.subsys[i][0], data.err.subsys[i][1], data.err.ecode[i][1]));
					}
					
					delete data.err.subsys;
					delete data.err.ecode;
				} //missing something or too many of something!!				
			}

			rs.contentType('javascript');
			return rs.send(data);

		});
		/*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			var warnings = [];

			if (!processed.fmt.exists) {
				warnings.push('FMT data missing from log. Some data may be incorrect. <a href="/help/errors#fmt">More on this problem</a>');
			}

			res.contentType('javascript');
			return res.send({messages: processed.err, 'warnings': warnings});
		});*/
	},

	params: function(req, res) {
		return loadAndSend(req,res,'parm', 'parm');
	},

	markers: function(req, res) {
		

		return loadLog(req, res, ['gps', 'mode', 'cam'], ['lat', 'lng', 'mode'], function(req, res, data) {
			
			var backgroundColours = {
				'alt_hold': '#e7b1b2',
				'althold': '#e7b1b2',
		    'stabilize': '#ecca9e',
		    'loiter': '#aad7a7',
		    'rtl' : '#fcc',
		    'land': '#e2dade',
		    'auto' : '#cfc',
		    'manual': '#ccf',
		    'fbw_a' : '#ffc',
		    'poshold': '#f8e8a6',
			};

			data.markings = [];
		  if (typeof data.mode != "undefined" && typeof data.mode.mode != "undefined") {
		  	for (k in data.mode.mode) {
			    data.markings.push(
			    	{
			    		xaxis: { 
			    			from: data.mode.mode[k].start, 
			    			to: data.mode.mode.end 
			    		},
			    		color: backgroundColours[data.mode.mode[k].name.toLowerCase()], 
			    		name: data.mode.mode[k].name
			    	}
		    	);
			  }
			}

		  if (typeof data.gps != "undefined" && typeof data.gps.lat != "undefined") {
			  data.readings = {
			  	first: data.gps.lat[0][0],
			  	last: data.gps.lat[data.gps.lat.length - 1][0],
			  	length: data.gps.lat.length
			  }
			} // else no gps data :(

			res.contentType('text/plain');
			return res.send(data);
			/*return res.send({
				//exists: (processed.gps.exists || processed.cam.exists), 
				lat: log.gps.lat, 
				lng: processed.gps.lng.values, 
				markings: markings, 
				cam: {lat: processed.cam.lat.values, lng: processed.cam.lng.values},
				readings: {
					first: processed.gps.readings[0],
					last: processed.gps.readings[processed.gps.readings.length - 1],
					length: processed.gps.readings.length
				}
			});*/
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};


function loadLog(req, res, channels, types, cb) {
  if (req.param('id')) {

  	flightId = req.param('id').trim();

		FlightChannel
		.find()
		.where({flight: flightId})
		.where({name: channels})
		.where({type: types})
		.exec(function(err, data){
			if (err) {
				sails.log.warn("Error finding log channel", err);
				return res.notFound();
			} else if (typeof data == 'undefined') {
				return res.notFound();
			} else {

				ret = {};

				var async = require('async');
				async.each(data, function(i, cb) {
					name = i.name;
					if (typeof ret[name] == "undefined") { 
						ret[name] = {};
					}

					type = i.type;
//					if (i.values.length < 10000) {
						ret[name][type] = i.values;
//					}	else {
//						Details:  RangeError: Maximum call stack size exceeded
//						ret[name][type] = RDPsd(i.values, 15);
//					}
					cb();

				}, function(err) {
					return cb(req,res,ret);
				});
			}
		});
  } else {
    return res.notFound();
  }
}

function loadAndSend(req, res, channels, types) {

	loadLog(req, res, channels, types, function(rq,rs,data) {
		rs.contentType('javascript');
		return rs.send(data);
	});

}

/*
	Ramer Douglas Peucker

	Marius Karthaus
	http://www.LowVoice.nl
 */
function RDPsd(points,epsilon){
    var firstPoint=points[0];
    var lastPoint=points[points.length-1];
    if (points.length<3){
        return points;
    }
    var index=-1;
    var dist=0;
    for (var i=1;i<points.length-1;i++){
        var cDist=distanceFromPointToLine(points[i],firstPoint,lastPoint);
        
        if (cDist>dist){
            dist=cDist;
            index=i;
        }
    }
    if (dist>epsilon){
        // iterate
        var l1=points.slice(0, index+1);
        var l2=points.slice(index);
        var r1=RDPsd(l1,epsilon);
        var r2=RDPsd(l2,epsilon);
        // concat r2 to r1 minus the end/startpoint that will be the same
        var rs=r1.slice(0,r1.length-1).concat(r2);
        return rs;
    }else{
        return [firstPoint,lastPoint];
    }
}
// code as suggested by Edward Lee

var distanceFromPointToLine = function (p,a,b){
    // convert array to object to please Edwards code;
    p={x:p[0],y:p[1]};
    a={x:a[0],y:a[1]};
    b={x:b[0],y:b[1]};
    return Math.sqrt(distanceFromPointToLineSquared(p,a,b));
}

//This is the difficult part. Commenting as we go.
var distanceFromPointToLineSquared = function (p, i, j){
	var lineLength = pointDistance(i,j);//First, we need the length of the line segment.
	if(lineLength==0){	//if it's 0, the line is actually just a point.
		return pointDistance(p,a);
	}
	var t = ((p.x-i.x)*(j.x-i.x)+(p.y-i.y)*(j.y-i.y))/lineLength; 

	//t is very important. t is a number that essentially compares the individual coordinates
	//distances between the point and each point on the line.

	if(t<0){	//if t is less than 0, the point is behind i, and closest to i.
		return pointDistance(p,i);
	}	//if greater than 1, it's closest to j.
	if(t>1){
		return pointDistance(p,j);
	}
	return pointDistance(p, { x: i.x+t*(j.x-i.x),y: i.y+t*(j.y-i.y)});
	//this figure represents the point on the line that p is closest to.
}

//returns distance between two points. Easy geometry.
var pointDistance = function (i,j){
	return sqr(i.x-j.x)+sqr(i.y-j.y);
}

//just to make the code a bit cleaner.
sqr = function (x){
	return x*x;
}