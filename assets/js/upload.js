$(function() {
	$('#legacyUploadBtn').click(function(e){
		e.preventDefault();

		$('#legacyUpload').removeClass('hide');
	});

	$("#uploadDropzone").dropzone({
		url: "/upload",
		paramName: "log",
		clickable: true,
		success: function( file, response) {
			if (typeof response.redirect != "undefined") {
				window.location = response.redirect;
			}
		}

	});

});