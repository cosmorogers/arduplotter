var app = {
	settings : {
		id: '',
		colours: ['#1E9CE5', '#B94A48', '#2D6987', '#356635']
	},
	map: {
		map: null,
		drone: null,
		markers: [],
		flightPath: null,
		photoPath: null,
	},
	readings: null,
	playTimeout: null,
	graphs: [],

	init: function() {
		this.settings.id = $('#loading').data('id');
		$('#loading').hide();
		this.bindUIActions();
		this.googleMap();
		this.activateTab();
	},

	bindUIActions: function() {
		$('a[data-toggle="tab"]').on('show.bs.tab', this.tabChangeEvent);
		$(window).on('hashchange', this.activateTab);
		$('.toggle-size').on('click', this.toogleSize);
		$('.flight-duration-cal').on('change', this.recalcDuration);
		$('#playMapBtn').on('click', this.togglePlayMap);
		$(".flot-graph").on('plothover', this.graphHover);
	},

	toogleSize: function(e) {
		var cont = $(this).parents('.panel').parent('div');
		if (cont.hasClass('col-md-6')) {
			cont.removeClass('col-md-6').addClass('col-md-12');
			cont.find('div.flot-graph').height('600px');
			$(this).children('span').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		} else {
			cont.removeClass('col-md-12').addClass('col-md-6');
			cont.find('div.flot-graph').height('300px');
			$(this).children('span').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		}
	},

	activateTab: function() {
		if (location.hash !== '') {
			$('a[href="' + location.hash + '"]').tab('show');
		} else {
			//Showing messages intial tab
			app.tabChange('#messages');
		}
	},

	tabChangeEvent: function(e) {
		if(history.pushState) {
      history.pushState(null, null, '#'+$(e.target).attr('href').substr(1));
		} else {
			location.hash = '#'+$(e.target).attr('href').substr(1);
   	}
		app.tabChange($(e.target).attr('href'));
	},

	tabChange: function(tab) {
		var target = $(tab),
		loading = $('#loading'),
		progressbar = $('#loading .progress .progress-bar'),
		m = tab.substr(1);

		if (typeof modules[m] !== 'undefined' && modules[m].initd !== true) {

			loading.show();
			progressbar.css('width', '0%');

			$.ajax({
	    	xhr: function() {
	        var xhr = new window.XMLHttpRequest();
					xhr.addEventListener("progress", function(evt) {
						if (evt.lengthComputable) {
							var percentComplete = (evt.loaded / evt.total) * 100;
							progressbar.css('width', percentComplete + '%');
						}
					}, false);
					return xhr;
				},
				type: 'GET',
				url: '/details/' + tab.substr(1) + '/' + app.settings.id,
				data: {},
				dataType: 'json',
				success: function(data){
					modules[m].init(data);
					loading.delay(800).fadeOut();
				},
				error: function(data){
					alert('Sorry, something went wrong fetching the graph data. If you are using an old version of you browser please update and try again.');
					loading.delay(800).fadeOut();
				}
			});
		}
	},
	
	googleMap: function() {
	  var mapOptions = {
	    zoom: 2,
	    center: new google.maps.LatLng(0,0),
	    mapTypeId: google.maps.MapTypeId.SATELLITE
	  };

	  app.map.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	  var image = {
	  	url: '/images/quad.png',
  		size: new google.maps.Size(32, 32),
    	origin: new google.maps.Point(0,0),
    	anchor: new google.maps.Point(16,16)
	  };

  	app.map.drone = new google.maps.Marker({
      position: app.map.map.getCenter(),
      map: app.map.map,
      icon: image,
      visible: true,
	  });

  	app.loadMarkers();
	},

	loadMarkers: function() {
		$.ajax({
			url: '/details/markers/' + app.settings.id,
			dataType: 'json',
			success: function(data) {
				
				app.map.markings = data.markings; //Graph boundry markings
				app.readings = data.readings;

				if (typeof data.gps != "undefined") {
					var first = null;

					if (data.gps.lng.length > 0) {
						app.map.flightPath = new google.maps.Polyline({
			    			path: [],
			    			geodesic: true,
			    			strokeColor: '#FF0000',
			    			strokeOpacity: 1.0,
			    			strokeWeight: 2,
			    			map: app.map.map
		  			});
						
						for (m in data.gps.lng) {
							if (first === null) {
								first = new google.maps.LatLng( data.gps.lat[m][1], data.gps.lng[m][1])
							}
			  			app.map.flightPath.getPath().push(new google.maps.LatLng( data.gps.lat[m][1], data.gps.lng[m][1]));
						}
					}
					
					//Camera data
					if (typeof data.cam != "undefined" && data.cam.lng.length > 0) {
						app.map.photoPath = new google.maps.Polyline({
			    			path: [],
			    			geodesic: true,
			    			strokeColor: '#000000',
			    			strokeOpacity: 1.0,
			    			strokeWeight: 1,
			    			map: app.map.map
		  			});

						var photoCount = 1;
						var image = '/images/photo.png';
						for (c in data.cam.lng) {
							var pos = new google.maps.LatLng( data.cam.lat[c][1], data.cam.lng[c][1]);
							if (first === null) {
								first = pos;
							}
							
							var marker = new google.maps.Marker({
								map: app.map.map,
								position: pos,
								title : "Photo #" + photoCount,
								icon: image
							});

							app.map.markers.push(marker);

							app.map.photoPath.getPath().push(pos);
							
							photoCount++;
						}
					}

					if (first !== null) {
						app.map.drone.setPosition(first);
						app.map.map.panTo(first);
						app.map.map.setZoom(18);
					}
						
					$('#mapLoading').hide();
					
				} else {
					$('#mapLoadingMsg').hide();
					$('#mapNoGpsError').removeClass('hide');
				}
			}, 
			error: function(data) {

			}
		});
	},

	recalcDuration: function(e) {
		var cur = $('#currentDrawInput').val(),
		cap = $('#batteryCapacityInput').val();
		
		var dur = parseFloat(((cap / 1000 / cur) * 60 ) * 0.8).toFixed(2);
		$('#estFlightDurationInput').val(dur);
	},

	play: function(i) {
		var pos = app.map.flightPath.getPath().getAt(i);

		if (typeof pos !== undefined && pos != null) {
			var latLng = new google.maps.LatLng(pos.lat(), pos.lng());
			app.map.map.setCenter(latLng);
			app.map.drone.setPosition(latLng);


			xPos = ( i / app.map.flightPath.getPath().length ) * (app.readings.last - app.readings.first) + app.readings.first
			

			app.graphs.map(function(v) {v.setCrosshair({x: xPos})});

		}

		if (i < app.map.flightPath.getPath().length) {
			app.playTimeout = setTimeout(function() {
				app.play(i+1);
			}, 30);
		}
	},

	stop: function() {
		if (app.playTimeout) {
			clearTimeout(app.playTimeout);
			app.playTimeout = null;
		}
	},

	togglePlayMap: function(e) {
		if (app.playTimeout) {
			app.stop();
		} else {
			app.play(0);
		}
	},

	graphHover: function (event, posi, item) {
		if (app.readings !== null) {
  		var x = parseInt(posi.x);

  		//get aprox pos
  		var index = Math.round( ((x - app.readings.first) / (app.readings.last - app.readings.first) ) * (app.readings.length));

			if (index > 0) {
				var pos = app.map.flightPath.getPath().getAt(index);
				if (typeof pos != "undefined") {
					app.map.drone.setPosition(new google.maps.LatLng(pos.lat(), pos.lng()));
				}
			}
  	}
  },
	
}

var modules = {
	power: {
		initd : false,
		init: function(data) {
			this.initd = true;
			app.graphs.push($.plot('#current-graph',[{
				label: 'Current', 
				data: data.power.curr,
				color: app.settings.colours[0],
			}, {
				label: 'Average Current', 
				data: data.power.avgcurr,
				color: app.settings.colours[1],
			}], {
	    	grid: {
	    		hoverable: true,
	      	backgroundColor: { colors: ["#fff", "#eee"] },
	      	markings: app.map.markings 
	    	},
	  		series: { shadowSize: 0 },
	  		xaxis: { ticks:[] },
	  		crosshair: { mode: "x" },
			}));
		  app.graphs.push($.plot('#totcurrent-graph',[{
				label: 'Total Current', 
				data: data.power.currtot,
				color: app.settings.colours[0],
			}], {
	    	grid: {
	    		hoverable: true,
	      	backgroundColor: { colors: ["#fff", "#eee"] },
	      	markings: app.map.markings 
	    	},
	    	series: { shadowSize: 0 },
	    	xaxis: { ticks:[] },
	    	crosshair: { mode: "x" },
	  	}));
			app.graphs.push($.plot('#voltage-graph',[{
				label: 'Voltage', 
				data: data.power.volt,
				color: app.settings.colours[0],
			}, {
				label: 'Board Voltage', 
				data: data.power.vcc,
				color: app.settings.colours[1]
			}], {
				grid: {
	    		hoverable: true,
					backgroundColor: { colors: ["#fff", "#eee"] },
					markings: app.map.markings 
	    	},
	    	series: {
	    		lines: { show: true },
	      	shadowSize: 0 
	    	},
	    	xaxis: { ticks:[] },
	    	crosshair: { mode: "x" },
	  	}));

	  	avgcur = data.power.avgcurr[data.power.avgcurr.length -1][1].toFixed(2);
			$('#totCurrent').text(data.power.currtot[data.power.currtot.length - 1][1].toFixed(2));
			$('#avgCurrent').text(avgcur);

			$('#batteryCapacityInput').val(data.battery.toFixed(0));
			$('#currentDrawInput').val(avgcur);
			$('#flightDuration').val(data.time / 60000);
			$('.flight-duration-cal').change();
		}
	}, 
	altitude : {
		initd : false,
		init: function(data) {
			this.initd = true;
			app.graphs.push($.plot('#altitude-graph',[
					/*{
						label: 'DS Alt', 
						data: data.ctun.wpalt,
						color: '#0f0',
					},*/{
						label: 'GPS', 
						data: data.gps.alt,
						color: app.settings.colours[0],
					},
					{
						label: 'GPS Rel', 
						data: data.gps.relalt,
						color: app.settings.colours[2],
					},
					{
						label: 'Sonar', 
						data: data.ctun.sonalt,
						color: app.settings.colours[0],
					}, {
						label: 'Barometer', 
						data: data.ctun.baralt,
						color: app.settings.colours[1],
					}
				], {
			    grid: {
			    	hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
					crosshair: { mode: "x" },
			    xaxis: { ticks:[], zoomRange: false, panRange: false },
			    zoom: {
						interactive: true
					},
					pan: {
						interactive: true
					}
			  }
		  ));
		  app.graphs.push($.plot('#throttle-graph',[
				{
					label: 'In', 
					data: data.ctun.thrin,
					color: app.settings.colours[0],
				}, {
					label: 'Out', 
					data: data.ctun.throut,
					color: app.settings.colours[1],
				}
			], {
		    grid: {
		    	hoverable: true,
		      backgroundColor: { colors: ["#fff", "#eee"] },
		      markings: app.map.markings 
		    },
		    series: { shadowSize: 0 },
		    xaxis: { ticks:[] },
		    crosshair: { mode: "x" },
		  }));

		  app.graphs.push($.plot('#crate-graph',[
				{
					label: 'Climb Rate', 
					data: data.ctun.crate,
					color: app.settings.colours[0],
				}, {
					label: 'Desired Climb Rate', 
					data: data.ctun.dcrate,
					color: app.settings.colours[1],
				}
			], {
		    grid: {
		    	hoverable: true,
		      backgroundColor: { colors: ["#fff", "#eee"] },
		      markings: app.map.markings 
		    },
		    series: { shadowSize: 0 },
		    xaxis: { ticks:[] },
		    crosshair: { mode: "x" },
		  }));
		}
	},
	attitude : {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#attitude-roll-graph',[
					{
						label: 'Roll In', 
						data: data.att.rollin,
						color: app.settings.colours[0],
					}, {
						label: 'Roll', 
						data: data.att.roll,
						color: app.settings.colours[1],
					}
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );

			$.plot('#attitude-pitch-graph',[
					{
						label: 'Pitch In', 
						data: data.att.pitchin,
						color: app.settings.colours[0],
					}, {
						label: 'Pitch', 
						data: data.att.pitch,
						color: app.settings.colours[1],
					}
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );

			$.plot('#attitude-yaw-graph',[
					{
						label: 'Yaw In', 
						data: data.att.yawin,
						color: app.settings.colours[0],
					}, {
						label: 'Yaw', 
						data: data.att.yaw,
						color: app.settings.colours[1],
					}/*, {
						label: 'Nav Yaw', 
						data: data.att.navyaw,
						color: app.settings.colours[2],
					}*/
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );

		}
	},
	gps : {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#gps-status-graph',[
					{
						label: 'Status', 
						data: data.gps.status,
						color: app.settings.colours[0],
					},
					{
						label: 'HDop', 
						data: data.gps.hdop,
						color: app.settings.colours[1],
					}
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );

			$.plot('#gps-satellites-graph',[
					{
						label: 'Satellites', 
						data: data.gps.nsats,
						color: app.settings.colours[0],
					}
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );

			$.plot('#gps-speed-graph',[
					{
						label: 'Speed', 
						data: data.gps.spd,
						color: app.settings.colours[0],
					},
					{
						label: 'Avg Speed', 
						data: data.gps.avgspd,
						color: app.settings.colours[1],
					}
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			  }
		  );
			$('#avgSpeed').text(data.gps.avgspd[data.gps.avgspd.length - 1][1].toFixed(2));
		}
	},
	imu : {
		initd : false,
		init: function(data) {
			this.initd = true;
			myMarkings = [];

			for (var i in app.map.markings) {
    	  if (app.map.markings.hasOwnProperty(i)) {
         myMarkings.push(app.map.markings[i]);
        }
      }
      //Otherwise lines appear underneath...
      myMarkings.push({ color: '#000', lineWidth: 2, yaxis: { from: 3, to: 3 } },
        			{ color: '#000', lineWidth: 2, yaxis: { from: -3, to: -3 } },
        			{ color: '#A34297', lineWidth: 2, yaxis: { from: -5, to: -5 } },
        			{ color: '#A34297', lineWidth: 2, yaxis: { from: -15, to: -15 } });
			
			$.plot('#vibrations-graph',[
					{
						label: 'AccX', 
						data: data.imu.accx,
						color: app.settings.colours[0],
					},
					{
						label: 'AccY', 
						data: data.imu.accy,
						color: app.settings.colours[1],
					},
					{
						label: 'AccZ', 
						data: data.imu.accz,
						color: app.settings.colours[2],
					},
				], {
			    grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: myMarkings
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[], panRange: [0, data.imu.accx[data.imu.accx.length - 1][0]+100 ] },
			    yaxis: { panRange: [-90, 90] },
			    crosshair: { mode: "x" },
			    zoom: {
						interactive: true
					},
					pan: {
						interactive: true
					}
			  }
		  );

		}
	},
	ntun: {
		initd : false,
		data: [],
		options: {},
		init: function(data) {
			this.initd = true;
			this.data = [{
						label: 'Velocity X', 
						data: data.ntun.velx,
						color: app.settings.colours[0],
					},
					{
						label: 'Desired Velocity X', 
						data: data.ntun.dvelx,
						color: app.settings.colours[1],
					},
					{
						label: 'Velocity Y', 
						data: data.ntun.vely,
						color: app.settings.colours[2],
					},
					{
						label: 'Desired Velocity X', 
						data: data.ntun.dvely,
						color: app.settings.colours[3],
					}];
					this.options = {
					grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			    yaxis: { min: -1000, max: 1000 },
			  };
			var ntunplot = $.plot('#ntun-velocity-graph',this.data, this.options);

			var that = this;
			$("#ntun-velocity-graph").bind("plotselected", function (event, ranges) {
				// clamp the zooming to prevent eternal zoom
				if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
					ranges.xaxis.to = ranges.xaxis.from + 0.00001;
				}

				if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
					ranges.yaxis.to = ranges.yaxis.from + 0.00001;
				}
				// do the zooming
				ntunplot = $.plot("#ntun-velocity-graph", that.data,
					$.extend(true, {}, that.options, {
						xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
						yaxis: { min: -1000, max: 1000 }
					})
				);
				//ntunplot.res

					// don't fire event on the overview to prevent eternal loop

					//overview.setSelection(ranges, true);
				});

		  $.plot('#ntun-velocity-overview-graph',this.data, {
					grid: {
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },

			    series: { shadowSize: 0 ,
			    	lines: { show: true,lineWidth: 1 }
			    },
			    yaxis: { ticks: false, min: -500, max: 500 },
			    xaxis: { ticks:[] },
			    selection: { mode: "x" },
					legend: { show: false },
			  }			 
		  );

		  $("#ntun-velocity-overview-graph").bind("plotselected", function (event, ranges) {
				ntunplot.setSelection(ranges);
			});

		}
	},
	mag: {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#mag-graph',[
					{
						label: 'Magnetic Field', 
						data: data.mag.magfield,
						color: app.settings.colours[0],
					},
					{
						label: 'Throttle',
						data: data.ctun.thrin,
						color: app.settings.colours[1],
					}
				], {
					grid: {
		    		hoverable: true,
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: app.map.markings 
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			    crosshair: { mode: "x" },
			    zoom: {
						interactive: true
					},
					pan: {
						interactive: true
					}
			  }
		  );
		}
	},
	messages: {
		initd : false,
		init: function(data) {
			this.initd = true;
			
			if (typeof data.msg != "undefined" && typeof data.msg.msg != "undefined" && data.msg.msg.length > 0) {
				for (k in data.msg.msg) {
					var alert = $('<div class="alert alert-info" />').data('id', data.msg.msg[k][0]);
          var msg = $('<p />').text(data.msg.msg[k][1]);
	        alert.append(title).append(msg);
	        $('#logMessagesContent').append(alert);
	      }
			}

			if (typeof data.err != "undefined" && typeof data.err.err != "undefined" && data.err.err.length > 0) {
				for (k in data.err.err) {
					var alert = $('<div class="alert alert-danger" />');
          var title = $('<strong>').text(data.err.err[k].type)
          var msg = $('<p />').text(data.err.err[k].msg);
	        alert.append(title).append(msg);
	        $('#logMessagesContent').append(alert);
	      }
			} else {
				$('#logMessagesContent').append('<div class="alert alert-success"><strong>Hooray!</strong> It would seem that you don\'t have any error messages from this flight</div>');
			}

			

			if (typeof data.warn != "undefined" && data.warn.length > 0) {
				$('#logWarnings').removeClass('hide');
				$('#logWarningsContent').text('');
				for (var i = 0; i < data.warnings.length; i++) {
					$('#logWarningsContent').append('<div class="alert alert-warning">' + data.warnings[i] + '</div>')
				} 
			}
		}
	},
	params: {
		initd : false,
		init: function(data) {
			this.initd = true;
			var table = $('#paramsTable tbody');
    	for (var k in data.parm.parm) {
    		var name = $('<td />').text(k),
    		value = $('<td />').text(data.parm.parm[k]);

    		var row = $('<tr />').append(name).append(value);
    		table.append(row);
    	}
		}
	}
}