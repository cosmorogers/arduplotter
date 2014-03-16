$(function() {
	$('#legacyUploadBtn').click(function(e){
		e.preventDefault();

		$('#legacyUpload').removeClass('hide');
	});

	$("#uploadDropzone").dropzone({
		url: "/upload",
		paramName: "flightlog",
		clickable: true,
		maxFiles: 1,
		createImageThumbnails: false,
		acceptedFiles: 'text/x-log,text/plain',
		accept: function(file, done) {
			console.log(file);
			done();
		},
		previewTemplate: '<div class="container"><div class="dz-preview dz-file-preview">' +
  		'<div class="dz-details">' +
    		'<h4><span data-dz-name></span> <span class="label label-default" data-dz-size></span></h4>' +
  			'<img data-dz-thumbnail />' +
  			'</div>'+
  			'<div class="dz-progress progress"><span class="dz-upload progress-bar" data-dz-uploadprogress></span></div>'+
  			'<p class="dz-error-message text-danger"><span data-dz-errormessage></span></p>'+
			'</div></div>',
		success: function( file, response) {
			if (typeof response.redirect != "undefined") {
				window.location = response.redirect;
			} else if (typeof response.error != "undefined") {
				$('#uploadError').removeClass('hide');
			}
		}

	});

});