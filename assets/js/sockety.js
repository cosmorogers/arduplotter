/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */

var waitForUpload = function(id) {
	io.socket.on('upload-progress', function(data){ 
		if (id === data.id) {
			$('#progress-msg').text(data.msg);
		}
	});
  io.socket.on('processed', function(data){ 
    if (id === data.id) {
      window.location.reload(); 
    }
  });
}