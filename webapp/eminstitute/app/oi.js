jQuery(document).ready(function() 
{ 

lQuery(".attachtext input,.attachtext textarea").livequery("click",function(e)
{
	$(".showonfocus").show();

});

lQuery("#feed-add-btn ").livequery("click",function(e)
{
	e.preventDefault();
	$(".showonfocus").toggle();
	$(this).hide();
	//$(".uploaddescription").attr("placeholder","Start typing");

});

lQuery(".uploaddescription").livequery("keyup",function(e)
{
	//submit
	var targetdiv = $(this).data("targetdiv");
	if( e.keyCode == "13" )
	{
		var form = jQuery("#uploaddata");
		form.ajaxSubmit({
			error: function(data ) {
				alert("error");
				$("#" + targetdiv).html(data);
				//$("#" + targetdiv).replaceWith(data);
			},
			success : function(result, status, xhr, $form) {
	        	$("#" + targetdiv).replaceWith(result);
	    	},
			data: { oemaxlevel: 1 }
		 });
	} 
});

lQuery("#autofinishbutton").livequery("click",function(e)
{
	e.preventDefault(); 
	var button = $(this);
	var href = button.attr('href');
	var args = button.data();
	args["collectionid"] = $("#currentcollection").val(); 
	args["sourcepath"] = $("#customsourcepath").val(); 
	args["uploaddescription"] = $("#uploaddescription").val(); 
	
	console.log(href,args);
	jQuery.get(href,args, function(response) 
	{
		var okpage = button.data("okpage");	
		window.location.href = okpage;
	});
});


lQuery(".sidebartogglebtn").livequery("click",function(e)
{
	e.stopPropagation()
	$(this).toggle();
	$("#oisidebar").toggleClass('sidebaractive');
});
lQuery(".sidebartogglebtnout").livequery("click",function(e)
		{
			e.stopPropagation()
			$("#oisidebar").toggleClass('sidebaractive');
			$(".sidebartogglebtn").toggle();
		});

	lQuery(".channelviewer").livequery("click",function(e)
	{
			e.stopPropagation();
			var clicked = $(this);
			if(clicked.attr("noclick") =="true") {
				return true;
			}
			
			e.preventDefault();
			e.stopPropagation()
			
			//var feedarea = clicked.closest(".feedcard");
			var uploadid = clicked.data("uploadid");
			showUpload(uploadid);
	});
	lQuery("#hiddenoverlay").livequery("click",function(e)
	{
			e.stopPropagation();
			 var $caller = $(e.target);
             if( $caller.prop("id") == "hiddenoverlay" )
             {
				hideOIOverlayDiv();
			 }
	});

	lQuery(".OIoverlay-close").livequery("click", function(e)
	{
			hideOIOverlayDiv();
			e.stopPropagation();
	});
	
	showUpload = function(uploadid)
	{
		window.location.hash = 'showupload-' + uploadid;
	
		var href = $("#application").data("viewertemplate");
		var params = {};
		
		params["showupload"] = uploadid;
		params["oemaxlevel"] = 1;
		$.get(href, params, function(data) 
		{
			var overlay = getOIOverlay();
			overlay.html(data);
			showOIOverlayDiv();
		});
	};	

	getOIOverlay = function()
	{
		var hidden = $("#hiddenoverlay");
		if( hidden.length == 0 )
		{
			$('body').prepend('<div id="hiddenoverlay"></div>');	
			initOIKeyBindings();	
		}
		hidden = $("#hiddenoverlay");
		return hidden;
    }

	showOIOverlayDiv = function()
	{
		var overlay = getOIOverlay();
		stopautoscroll = true;
		$("body").css({ overflow: 'hidden' })
		overlay.show();
		var lastscroll = $(window).scrollTop();
		overlay.data("lastscroll",lastscroll);
	}

	initOIKeyBindings = function(hidden)
	{
		
		$(document).keydown(function(e)
		{
			if( hidden && !hidden.is(":visible") )
			{
				return;
			}
			var target  = e.target;
			if ($(target).is('input') || $(target).is('.form-control') ) {
				return;
			}
		    switch(e.which) 
		    {
		        // TODO: background window.scrollTo the .masonry-grid-cell we view, so we can reload hits
		        case 27: // esc
	        		hideOIOverlayDiv();
		        break;
		
		
		        default: return; // exit this handler for other keys
		    }
		    e.preventDefault(); // prevent the default action (scroll / move caret)
		});
	}
	OIdisposevideos = function()
	{
		//Stop/Dispose Videos
		$('#hiddenoverlay .video-js, #hiddenoverlay .video-player').each(function () {
			if (this.id) {
				videojs(this.id).dispose();
			}
		});
	}
	
	hideOIOverlayDiv = function()
	{
		
		var hidden = getOIOverlay();
		OIdisposevideos();
		stopautoscroll = false;
		$("body").css({ overflow: 'auto' })
		hidden.hide();
		var lastscroll = hidden.data("lastscroll");
		//remove Asset #hash
		history.replaceState(null, null, ' '); 
		$(window).scrollTop( lastscroll );
	}
	
	var showuploadid = $("#application").data("showuploadid");	
	if( showuploadid )
	{
	   showUpload(showuploadid);
	}
	else
	{
	  var hash = window.location.hash;
	  if (hash && hash.startsWith('#showupload-'))
      {
        var uploadid = hash.substring(12,hash.length);
        if (uploadid)
        {
            showUpload(uploadid);
        }
      }
    }
	
	
});

