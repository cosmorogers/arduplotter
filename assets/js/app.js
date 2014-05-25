var app = {
	settings : {
		id: '',
		colours: ['#1E9CE5', '#B94A48', '#2D6987', '#356635']
	},

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
	},

	toogleSize: function(e) {
		var cont = $(this).parents('.panel').parent('div');
		if (cont.hasClass('col-md-6')) {
			cont.removeClass('col-md-6').addClass('col-md-12');
			$(this).children('span').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		} else {
			cont.removeClass('col-md-12').addClass('col-md-6');
			$(this).children('span').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		}
	},

	activateTab: function() {
		if (location.hash !== '') {
			$('a[href="' + location.hash + '"]').tab('show');
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
					alert('error');
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

	  app.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	  var image = {
	  	url: '/images/quad.png',
  		size: new google.maps.Size(32, 32),
    	origin: new google.maps.Point(0,0),
    	anchor: new google.maps.Point(16,16)
	  };

  	app.marker = new google.maps.Marker({
      position: app.map.getCenter(),
      //map: app.map,
      icon: image
	  });
	}
}


var modules = {
	power: {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#current-graph',[{
				label: 'Current', 
				data: data.power.curr.values,
				color: app.settings.colours[0],
			}], {
	//    	grid: {
	//      	backgroundColor: { colors: ["#fff", "#eee"] },
	//      	markings: <%- JSON.stringify(markings) %>
	//    	},
	  		series: { shadowSize: 0 },
	  		xaxis: { ticks:[] },
			});
		  $.plot('#totcurrent-graph',[{
				label: 'Total Current', 
				data: data.power.currtot.values,
				color: app.settings.colours[0],
			}], {
	//    	grid: {
	//      	backgroundColor: { colors: ["#fff", "#eee"] },
	//      	markings: <%- JSON.stringify(markings) %>
	//    	},
	    	series: { shadowSize: 0 },
	    	xaxis: { ticks:[] },
	  	});
			$.plot('#voltage-graph',[{
				label: 'Voltage', 
				data: data.power.volt.values,
				color: app.settings.colours[0],
			}, {
				label: 'Board Voltage', 
				data: data.power.vcc.values,
				color: app.settings.colours[1]
			}], {
	//				grid: {
	//				backgroundColor: { colors: ["#fff", "#eee"] },
	//				markings: <%- JSON.stringify(markings) %>
	//    	},
	    	series: {
	    		lines: { show: true },
	      	shadowSize: 0 
	    	},
	    	xaxis: { ticks:[] },
	  	});
		}
	}, 
	altitude : {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#altitude-graph',[
					{
						label: 'GPS', 
						data: data.gps.alt.values,
						color: app.settings.colours[0],
					}, {
						label: 'GPS Rel', 
						data: data.gps.relalt.values,
						color: app.settings.colours[2],
					},{
						label: 'Sonar', 
						data: data.ctun.sonalt.values,
						color: app.settings.colours[3],
					}, {
						label: 'Barometer', 
						data: data.ctun.baralt.values,
						color: app.settings.colours[1],
					}
				], {
//			    grid: {
//			    	hoverable: true,
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
					crosshair: { mode: "x" },
			    xaxis: { ticks:[] },
			  }
		  );
		  $.plot('#throttle-graph',[
				{
					label: 'In', 
					data: data.ctun.thrin.values,
					color: app.settings.colours[0],
				}, {
					label: 'Out', 
					data: data.ctun.throut.values,
					color: app.settings.colours[1],
				}
			], {
//		    grid: {
//		      backgroundColor: { colors: ["#fff", "#eee"] },
//		      markings: <%- JSON.stringify(markings) %>
//		    },
		    series: { shadowSize: 0 },
		    xaxis: { ticks:[] },
		  });

		  $.plot('#crate-graph',[
				{
					label: 'Climb Rate', 
					data: data.ctun.crate.values,
					color: app.settings.colours[0],
				}, {
					label: 'Desired Climb Rate', 
					data: data.ctun.dcrate.values,
					color: app.settings.colours[1],
				}
			], {
//		    grid: {
//		      backgroundColor: { colors: ["#fff", "#eee"] },
//		      markings: <%- JSON.stringify(markings) %>
//		    },
		    series: { shadowSize: 0 },
		    xaxis: { ticks:[] },
		  });
		}
	},
	attitude : {
		initd : false,
		init: function(data) {
			this.initd = true;
			$.plot('#attitude-roll-graph',[
					{
						label: 'Roll In', 
						data: data.att.rollin.values,
						color: app.settings.colours[0],
					}, {
						label: 'Roll', 
						data: data.att.roll.values,
						color: app.settings.colours[1],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			  }
		  );

			$.plot('#attitude-pitch-graph',[
					{
						label: 'Pitch In', 
						data: data.att.pitchin.values,
						color: app.settings.colours[0],
					}, {
						label: 'Pitch', 
						data: data.att.pitch.values,
						color: app.settings.colours[1],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			  }
		  );

			$.plot('#attitude-yaw-graph',[
					{
						label: 'Yaw In', 
						data: data.att.yawin.values,
						color: app.settings.colours[0],
					}, {
						label: 'Yaw', 
						data: data.att.yaw.values,
						color: app.settings.colours[1],
					}, {
						label: 'Nav Yaw', 
						data: data.att.navyaw.values,
						color: app.settings.colours[2],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
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
						data: data.gps.status.values,
						color: app.settings.colours[0],
					},
					{
						label: 'HDop', 
						data: data.gps.hdop.values,
						color: app.settings.colours[1],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			  }
		  );

			$.plot('#gps-satellites-graph',[
					{
						label: 'Satellites', 
						data: data.gps.nsats.values,
						color: app.settings.colours[0],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			  }
		  );

			$.plot('#gps-speed-graph',[
					{
						label: 'Speed', 
						data: data.gps.spd.values,
						color: app.settings.colours[0],
					},
					{
						label: 'Avg Speed', 
						data: data.gps.lAvgSpd,
						color: app.settings.colours[1],
					}
				], {
//			    grid: {
//			      backgroundColor: { colors: ["#fff", "#eee"] },
//			      markings: <%- JSON.stringify(markings) %>
//			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
			  }
		  );

		}
	},
	imu : {
		initd : false,
		init: function(data) {
			this.initd = true;
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
			      backgroundColor: { colors: ["#fff", "#eee"] },
			      markings: [
			      	{ color: '#000', lineWidth: 2, yaxis: { from: 3, to: 3 } },
        			{ color: '#000', lineWidth: 2, yaxis: { from: -3, to: -3 } },
        			{ color: '#A34297', lineWidth: 2, yaxis: { from: -5, to: -5 } },
        			{ color: '#A34297', lineWidth: 2, yaxis: { from: -15, to: -15 } },
      			]
			    },
			    series: { shadowSize: 0 },
			    xaxis: { ticks:[] },
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
}



$(function() {
	app.init();  
});
