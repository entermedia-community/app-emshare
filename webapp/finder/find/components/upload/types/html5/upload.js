var uploadid = new Date().getTime(); 
var home = null;
var currentupload = 0;
var haderror = false;
var uploadid;
	
// wait for the DOM to be loaded 
$(document).ready(function() 
{	
	function filesPicked(event, files) 
	{
		//merge them together
		for (var i = 0; i < files.length; i++) 
	 	{
	    	var file = files[i];
	    	if( file.size > 0)
		    {
	    		allfiles.push(file);
		    }
	    }
		
	    files = allfiles;
		var inputbox = $("#upload_field")[0];
		$("#upload_field").triggerHandler("html5_upload.setFiles",[allfiles]);
		
		inputbox.count = allfiles.length;
		
	 	//$("#upload_field").setFiles( allfiles );
	 	
	 	$("#uploadinstructionsafter").hide();
		var startb = $("#startbutton");
		$(startb).text("Upload");
		$(startb).prop('disabled', false);
		$("#uploadinstructionsafter").show();
		$(".showonselect").show();
		
		 
		 var regex = new RegExp("currentupload", 'g');  
		 
	    $("#up-files-list").empty();
	     //return confirm("You are trying to upload " + total + " files. Are you sure?");
		 for (var i = 0; i < files.length; i++) 
		 {
		    var file = files[i];
		    if( file.size > 0)
		    {
		    	if(i < 101){
		    		var html = $("#progress_report_template").html();
	        	    
	        	    html = html.replace(regex,i);
	        	    $("#up-files-list").append(html);
	        	    
	        	    //TODO: set the name and size of each row
	        	    var name = file.name;
	        	    if(file.webkitRelativePath){
	        	    	name = file.webkitRelativePath;
	        	    }
	        	    
	    	    	$("#progress_report_name" + i).text(name);
	        	    var size = bytesToSize(file.size,2);
	        	    $("#progress_report_size" + i).text(size);
		    	}
	    	    

		    }
		    
		 }
		 console.log("Picked " + files.length );
		 
	}
	var allfiles = new Array();
	
	siteroot = $("#application").data("siteroot") + $("#application").data("apphome"); 
	
	lQuery('#filePicker').livequery('click',function(e){
		e.preventDefault(); 
		$('#upload_field').trigger('click');
        
     });
	
	lQuery('#folderPicker').livequery('click',function(e){
		e.preventDefault(); 
		$('#upload_folder').trigger('click');
        
     });

	lQuery("#startbutton").livequery('click',function(e) 
    {
    	e.preventDefault(); 
    		
    	if ($(this).prop("disabled")) {
    		return;
    	}
    	var valid = $("#uploaddata").validate().form();
    	if(!valid){
    		return;
    	}
    	$(this).text("Uploading");
    	
    	$(this).attr('disabled', 'disabled');
    	//$(this).prop('disabled', true);
    	$("#viewassetsbtn").attr('disabled', 'disabled');
    	$("#upload_field").triggerHandler("html5_upload.start");
    	
    });


	lQuery(".drop-over").livequery(function()
	{
		var div = $(this);
		
		div.on( 'dragover',
		    function(e) {
		        e.preventDefault();
		        e.stopPropagation();
		        div.addClass("uploaddragenter");
		    }
		)
		div.on( 'dragenter',
		    function(e) {
		        e.preventDefault();
		        e.stopPropagation();
		        div.addClass("uploaddragenter");
		    }
		)
		div.on( 'dragleave',
		    function(e) {
		        div.removeClass("uploaddragenter");
		    }
		)
		div.on( 'drop',
		    function(e){
		        if(e.originalEvent.dataTransfer){
		            if(e.originalEvent.dataTransfer.files.length) {
		                e.preventDefault();
		                e.stopPropagation();
						$("#upload_field").triggerHandler('html5_upload.filesPicked', [e.originalEvent.dataTransfer.files]);						
		            }   
		        }
		        div.removeClass("uploaddragenter");
		    }
		);
	
	});
	
	initUpload = function(inputfield) {
		
		inputfield.html5_upload(
				   {
			         filesPicked: filesPicked,
			         url: function(number) {
			       		var url =  $("#uploaddata").attr("action");
			       		
			       		var str = $("#uploaddata").serialize();
			       		return url + "?" + str;
			            // return prompt(number + " url", "/");
			         },
			         autostart:false,
//			         extraFields: function() {
//			        	 return [];
//			         },         
			         sendBoundary: window.FormData || $.browser.mozilla,
			         onStart: function(event, total, files) 
			         {
			        	 //$(".uploadinstructions").hide();
		        	  	 //console.log("On start " + files.length );
			        	var completed = $("#up-files-list li").clone();
					    $("#up-files-list").empty();

						$("#up-files-list-completed").prepend(completed);
						$("#completed-uploads").show();
			        	 
						$("#upload-start").hide();
						$("#upload-completed").show();
						
			             return true;
			        	 //Loop over all the files. add rows
			        	 //alert("start");
			         },
			         onStartOne: function(event, name, number, total) {
			        	 //Set the currrent upload number?
			        	 currentupload = number;
			        	 return true;
			         },
			         onProgress: function(event, progress, name, number, total) {
			            // console.log(progress, number);
			         },
			//         genName: function(file, number, total) {
			//             return file;
			//         },
			//         setName: function(text) {
			//             $("#progress_report_name" + currentupload).text(text);
			//         },
			         setStatus: function(text) {
			        	 if( text == "Progress")
			        	 {
			        		 text = "Uploading";
			        	 }
			             $("#progress_report_status" + currentupload).text(text);
			         },
			         setProgress: function(val) {
			             $("#progress_report_bar" + currentupload).css('width', Math.ceil(val*100)+"%");
			         },
			         onFinishOne: function(event, response, name, number, total) {
			             $("#progress_report_bar" + currentupload).css('width', "100%");
			         },
			         onError: function(event, name, error) {
			             alert('error while uploading file ' + name);
			             haderror =true;
			         },
			         onFinish: function(event, total) {
			             //do a search
			        	 if( !haderror)
			        	{
			        			var startb = $("#startbutton");
			        			var complete = startb.data("complete");
			        			
			        			$(startb).text(complete);
			        			$(startb).prop('disabled', 'disabled');
		    				    allfiles = new Array();
		    				   
				   				var completed = $("#up-files-list-completed li span");
								$.each(completed,function()
								{
									$(this).removeAttr("id");
								});
		    				   $("#filePicker").text("Pick More Files...");
		    				   $("#upload_field").removeAttr('disabled');
		    				   
		    				   var viewassets = $("#viewassetsbtn");
			        		   viewassets.removeAttr('disabled');

			        		   if( viewassets.hasClass("autoclick"))
			        		   {
			        			   viewassets.trigger("click");
			        		   }
			        		   
							   var form = $( startb.closest("form"));
							   
		    				   if( form.hasClass("autofinishaction") )
		    				   {
		    				   	  var finishaction = form.data("finishaction");
		    				   	  form.attr("action",finishaction);
		    				   	  //TODO remove the last file?
		    				   	  //form.submit();
									
									var targetdiv = form.data("finishtargetdiv");
									form.ajaxSubmit({
										type : "get",
										target : "#" + $.escapeSelector(targetdiv) 
									});
								  

		    				   }			   
		    				   
		    				   //$("#uploadsfinishedtrigger").trigger("submit");
		    				   //$(".media_results_tab").data("tabloaded",false);
			        	}
			
			         }
			     });
		
	}
				
	lQuery("#upload_field").livequery( function() 
	{
		var inputfield = $(this);
		initUpload(inputfield);
	});
	
	lQuery("#upload_folder").livequery( function() 
	{
		var inputfield = $(this);
		initUpload(inputfield);
	});

	jQuery("#upload_field").val('');

	var allfiles = new Array();
	
	jQuery("#up-files-list").empty();

	lQuery("#viewassetsbtn").livequery("click", function(e) {
		e.preventDefault();
		var btn = jQuery(this);
	    var options = btn.data();
		var collectionid = jQuery("#currentcollection").val();
		var nodeid = $("#nodeid").val();
	    var href = null;
	    var customviewupload = btn.data("customviewupload");

	    if(customviewupload) {
	    		href= "siteroot"+customviewupload;
	    		if (collectionid) {
	    			if (href.indexOf("?") > -1) {
	    				href = href + "&";
	    			}
	    			else {
	    				href = href + "?";
	    			}
	    			href = href + "collectionid=" + collectionid;
	    		}
	    		if( nodeid)
		    	{
		    		href = href + "&nodeID=" + nodeid;
		    	}
	    	}
	    else if(collectionid) {
	    	href = siteroot+"/views/modules/librarycollection/showcategory.html?collectionid="+collectionid+"&sortby=assetaddeddateDown";
	    	if( nodeid)	{
	    		href = href + "&nodeID=" + nodeid;
	    	}
	    	else {
	    		var currentcollectionrootcategory = jQuery("#currentcollectionrootcategory").val();
	    		if (currentcollectionrootcategory) {
	    			href = href + "&nodeID=" + currentcollectionrootcategory;
	    		}
	    	}
	    	options.oemaxlevel = 1;	
	    }
	    else if( nodeid) {
	         href = siteroot+"/views/modules/asset/showcategory.html?sortby=assetaddeddateDown&nodeID=" + nodeid;;
		    	options.oemaxlevel = 2;	
		}
	    else  {
	        href = siteroot+"/views/modules/asset/index.html?sortby=assetaddeddateDown";
	    	options.oemaxlevel = 2;	
		}
	    //console.log(href);
	    //document.location.href = href;
	    var targetdiv = btn.data("targetdivinner");

		jQuery.ajax({

			url: href, 
			async: false, 
			data: options, 
			success: function (data) {
				jQuery('#'+targetdiv).html(data);
			}
		});
	    
	});
	
	
	
	//Detect Youtube Link
	$("#uploaddescription").on("keyup", function() {
		var input = $("#uploaddescription");
		var inputtext = input.val();
		var targetdiv = input.data("targetdiv");
		var targeturl = siteroot+"/collective/channel/addnewlink.html";
		delay(function () {
			var p = /(https:\/\/www\.(yotu\.be\/|youtube\.com)\/)(?:(?:.+\/)?(?:watch(?:\?v=|.+&v=))?(?:v=)?)([\w_-]{11})(&\.+)?/;
		    if(inputtext.match(p)){
				var videoURL = inputtext.match(p)[0];
				var videoID = inputtext.match(p)[3];
				var removelink = inputtext.replace(p, "");
				input.val(removelink);
				
				$("#"+targetdiv).load(targeturl+'?videoID='+videoID);
		    }            
			else {
			}
        	            
    	}, 500);
	
	});
	
}); 
	
var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

function bytesToSize(bytes, precision)
{  
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
   
    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';
 
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';
 
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';
 
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';
 
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';
 
    } else {
        return bytes + ' B';
    }
}
