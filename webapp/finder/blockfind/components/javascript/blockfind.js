jQuery(document).ready(function(){

	var href,emkey,inputname,loadedurl;
	
	
	showdialog = function(){
		var modal = $("#blockfindoverlay");
		var visibleHeight = $(window).height();
		var visibleWidth = $(window).width();
		modal.css("height", visibleHeight + "px");
		modal.css("width", visibleWidth + "px");
		modal.show();
		
		//this is launched early
		 gridResize();
		
	}
	
	loaddialog = function(href) {
		var modal = $("#blockfindoverlay");
		if( modal.length == 0 )
		{
			jQuery.ajax({
				url: href, async: false, data: {}, success: function (data) {
					jQuery('body').prepend(data);
					showdialog();
				},
				type: "POST",
				dataType: 'text',
				xhrFields: {
	                withCredentials: true
	            },
				crossDomain: true
			});
			return;
		}
		else {
			var options = {};
			options.oemaxlayout = "1";
			
			jQuery.ajax({
				url: href, async: false, data: options, success: function (data) {
					jQuery('#application').replaceWith(data);
					showdialog();
					
				},
				type: "POST",
				dataType: 'text',
				xhrFields: {
	                withCredentials: true
	            },
				crossDomain: true
			});
		}
	}
	
	jQuery(document).on("click", ".emediafinder", function(e){
		e.preventDefault();
		var clicked = $(this);
		href = clicked.data("emhref");
		emkey = clicked.data("emkey");
		href = href + "?entermedia.key="+emkey;
		inputname = clicked.data('inputidupload');
		
		loaddialog(href);
				
	});
	
	jQuery(document).on("click", "#btnupdateemurls", function(e){
		console.log(inputname);
		jQuery("#"+inputname).val($(this).data("hitsurls"));
		jQuery("#blockfindoverlay").hide();
	});
	
	
	jQuery(document).on("click", "#btncloseoverlay", function(e){
		jQuery("#blockfindoverlay").hide();
	});

});



