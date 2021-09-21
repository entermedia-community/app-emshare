jQuery(document).ready(function() 
{ 
	
	var appdiv = $('#application');
	var home = appdiv.data('home') + appdiv.data('apphome');

	if ('serviceWorker' in navigator) 
	{
		if ('PushManager' in window) 
		{
			//alert("enable push?");
			/*
			var applink = $("#application").data("apphome");	

			navigator.serviceWorker.register(applink + '/components/javascript/push/service-worker.js')
			  .then(function(registration) 
					  {
						  console.log('Service worker successfully registered.');
						  return registration;
					  }
			  ).catch(function(err) 
				  {
				    console.error('Unable to register service worker.', err);
				  });
			*/	  
		}
	}

	
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
		debugger;
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
		
		
	
	lQuery("#collectivesearch").livequery(function() {
			var theinput = $(this);
			var placeholder= $(this).data("placeholder");
			theinput.select2({
				theme : "bootstrap4",
				allowClear : false,
				minimumInputLength : 0,
				placeholder: placeholder
			}).on('select2:select', function (e) {
				var data = e.params.data;
				if (data.id) {
					if (data.text == '') {
						data.text = 'collective';
					}
					var name  = data.text;
					name = name.replace(/\ /g,'-');
					var collectivepage = $(this).data("url")+data.id+"/"+ name +'.html';
					console.log(collectivepage);
					window.location.assign( collectivepage );
				}			
			});
	});
	
	lQuery(".autosubmitlink").livequery(function() {
			var theinput = $(this);
			var dropdownParent = $("body");
			var dropdownParent = theinput.data('dropdownparent');
			if (dropdownParent && $("#" + dropdownParent).length) {
				dropdownParent = $("#" + dropdownParent);
			}
			var placeholder= $(this).data("placeholder");
			theinput.select2({
				theme : "bootstrap4",
				allowClear : false,
				minimumInputLength : 0,
				placeholder: placeholder,
				dropdownParent : dropdownParent
			}).on('select2:select', function (e) {
				var data = e.params.data;
				if (data.id) {
					var collectivepage = $(this).data("url")+data.id;
					window.location.href = collectivepage;
				}			
			});
	});
	


	//Detect Youtube Link
	$("#uploaddescription").on("keyup", function() {
		var input = $("#uploaddescription");
		var inputtext = input.val();
		var targetdiv = input.data("targetdiv");
		var targeturl = home+"/collective/channel/addnewlink.html";
		delay(function () {
			var p = /(https:\/\/www\.(yotu\.be\/|youtube\.com)\/)+(?:(?:.+\/)?(?:watch(?:\?v=|.+&v=))?(?:v=)?)([\w_-]{11})+(\&.+)?/;
		    if(inputtext.match(p)){
				var videoURL = inputtext.match(p)[0];
				var videoID = inputtext.match(p)[3];
				var removelink = inputtext.replace(p, "");
				input.val(removelink);
				
				$("#"+targetdiv).load(targeturl+'?fetchfrom=youtube&videoID='+videoID);	
				
				$("#uploaddata").attr('action', home+'/collective/channel/uploadlink.html?oemaxlevel=2');
				$("#uploaddata").addClass('ajaxform');
				
		    }            
			else {
				p = /(https:\/\/vimeo\.com\/)+([\w_-]{9})(&\.+)?/;
				if(inputtext.match(p)){
					var videoURL = inputtext.match(p)[0];
					var videoID = inputtext.match(p)[2];
					var removelink = inputtext.replace(p, "");
					input.val(removelink);
				
					$("#"+targetdiv).load(targeturl+'?fetchfrom=vimeo&videoID='+videoID);
				
					$("#uploaddata").attr('action', home+'/collective/channel/uploadlink.html?oemaxlevel=2');
					$("#uploaddata").addClass('ajaxform');
	
		    	}	
			}
        	            
    	}, 500);
	
	});	


lQuery(".chatter-send").livequery("click", function(){
		var button = jQuery(this);
		var chatter = button.closest(".chatterbox");
		var data = chatter.data();
	    var content = document.getElementById("chatter-msg").value;
	    data.content = content;
	    data.command= button.data("command");
	    //var json = JSON.stringify(data);
	    content.value="";

		var nextpage = data.notifylink;
		$.get(nextpage, data, function(data) {
			
		});
	    	
	});


lQuery("#adduserpicker .rowclick").livequery("click", function(e) {
	e.preventDefault();
	$(this).closest(".modal").modal("hide");
	var picker = $("#adduserpicker");
	var row = $(this);
	var rowid = row.attr("rowid");
	
	var targetdiv = picker.data("targetdiv");
	var targetdiv = $("#" + targetdiv);
	var nextpage = home + '/collective/channel/subscribers/addsave.html';
	var options = picker.data();
	options.teamuserid = rowid;
	options.addtoteam = "true";
	$.get(nextpage, options, function(data) {
		targetdiv.replaceWith(data);
	});

});


$("#saveproject").validate({
	  rules: {
		"name\.value": {
		  required: true,
		  minlength: 3,
		  maxlength: 20,
		  remote: home+"/site/sitedeployer/add/verifyproject.html"
		}
	  },
	  messages: {
		"name\.value": {
		  remote: "That Project Name is already taken, please try different one."
		}
	  },
	  errorElement: "div",
	  errorClass: "errormsg",
	  errorPlacement: function(error, element) {
		  error.appendTo( element.closest(".form-group").parent() );
		},
	  submitHandler: function(form) {
		   $("#loadingresult").show();
		   form.submit();
		   
		  }
});


});



