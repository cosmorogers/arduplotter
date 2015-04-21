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
		/*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({gps: {alt : processed.gps.alt, relalt: processed.gps.relalt}, ctun: processed.ctun});
		});*/
	},

	attitude: function(req, res) {
		return loadAndSend(req,res,'att');

	},

	gps: function(req, res) {
		return loadAndSend(req,res,'gps');
	},

	imu: function(req, res) {
		return loadLog(req,res,'imu', function(req, req, data) {
			toSend = {
				accx: RDPsd(data.accx, 10),
				accy: RDPsd(data.accy, 10),
				accz: RDPsd(data.accz, 10)
			}
			res.contentType('javascript');
			return res.send({imu: toSend});

		});
	},

	ntun: function(req, res) {
		return loadAndSend(req,res,'ntun');
		
	},

	mag: function(req, res) {
		/*return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);
			res.contentType('javascript');
			return res.send({mag: processed.mag, thr: processed.ctun.thrin});
		});*/
	},

	messages: function(req, res) {
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
		return loadAndSend(req,res,'param');
	},

	markers: function(req, res) {
		return res.notFound();
		return loadLog(req, res, function(req, res, log) {
			processed = ProcessService.process(log.json);

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

			var markings = [];
		  for (var k in processed.mode.modes) {
		    markings.push({xaxis: { from: processed.mode.modes[k].start, to: processed.mode.modes[k].end },color: backgroundColours[processed.mode.modes[k].name.toLowerCase()], name: processed.mode.modes[k].name});
		  }

			res.contentType('text/plain');
			return res.send({
				exists: (processed.gps.exists || processed.cam.exists), 
				lat: processed.gps.lat.values, 
				lng: processed.gps.lng.values, 
				markings: markings, 
				cam: {lat: processed.cam.lat.values, lng: processed.cam.lng.values},
				readings: {
					first: processed.gps.readings[0],
					last: processed.gps.readings[processed.gps.readings.length - 1],
					length: processed.gps.readings.length
				}
			});
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UploadController)
   */
  _config: {}

  
};


function loadLog(req, res, channel, cb) {
  if (req.param('id')) {

  	flightId = req.param('id').trim();

		FlightChannel
		.findOne()
		.where({_flight: flightId})
		.where({_name: channel})
		.exec(function(err, data){
			if (err) {
				sails.log.warn("Error finding log channel", err);
				return res.notFound();
			} else if (typeof data == 'undefined') {
				return res.notFound();
			} else {
				return cb(req,res,data);
			}
		});
  } else {
    return res.notFound();
  }
}

function loadAndSend(req, res, channel) {

	loadLog(req, res, channel, function(rq,rs,data) {
		//rq.contentType('javascript');
		var ret = {};
		ret[channel] = data
		return rs.send(ret);
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