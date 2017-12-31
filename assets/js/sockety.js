/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */

var hadMessage = false;

var waitForUpload = function(id) {
	io.socket.on('upload-progress', function(data){ 
		if (id === data.id) {
			hadMessage = true;
			$('#progress-msg').text(data.msg);
		}
	});
  io.socket.on('processed', function(data){ 
    if (id === data.id) {
      window.location.reload(); 
    }
  });

  var doubleCheckProgress = function() {
  	if (!hadMessage) {
  		$.get('/progress/' + id, function(data) {
  			if (data.processed) {
  				window.location.reload();
  			} else {
  				ms = (data.active > 1 ? 's' : '');
  				$('#progress-msg').text("Sorry, your log is in a queue of " + data.active + " log" + ms +" waiting for processing. Your log will be processed soon!");
  				setTimeout(doubleCheckProgress, 1000);
  			}
  		});
  	}
  }

  setTimeout(doubleCheckProgress, 1000)
}